import { createClient } from '@supabase/supabase-js';
import { InvoiceData, Customer, CustomerAddress, Area, Calculation, Lookup } from '../types';

// --- Supabase Configuration ---
const supabaseUrl = 'https://zcuxxugwmgoifmeahydl.supabase.co';
const STORAGE_KEY = 'sbt_transport_supabase_key';

// Safely access process.env, import.meta.env, or localStorage to get the key
const getSupabaseKey = () => {
    let key = '';

    try {
        // Vite / Modern bundler support
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_KEY) {
            // @ts-ignore
            key = import.meta.env.VITE_SUPABASE_KEY;
        }
    } catch (e) {
        // import.meta is not available
    }

    if (!key) {
        try {
            // Node / CRA / Next.js support
            // @ts-ignore
            if (typeof process !== 'undefined' && process.env) {
                // @ts-ignore
                if (process.env.SUPABASE_KEY) key = process.env.SUPABASE_KEY;
                // @ts-ignore
                else if (process.env.REACT_APP_SUPABASE_KEY) key = process.env.REACT_APP_SUPABASE_KEY;
            }
        } catch (e) {
            // process is not defined
        }
    }

    if (!key && typeof window !== 'undefined' && window.localStorage) {
        key = window.localStorage.getItem(STORAGE_KEY) || '';
    }

    // Return a placeholder if missing to prevent createClient crash on init.
    // We will check this placeholder before making requests.
    return key || 'MISSING_KEY'; 
};

const supabaseKey = getSupabaseKey();

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isKeyMissing = () => supabaseKey === 'MISSING_KEY';

export const updateSupabaseKey = (key: string) => {
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, key);
        window.location.reload();
    }
};

// --- Helper for Supabase Errors ---
const isTableMissing = (error: any) => error?.code === '42P01';

const handleSupabaseError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    if (isKeyMissing()) {
        throw new Error(`Supabase Key is missing. Please enter your API Key in the prompt.`);
    }
    if (error?.message?.includes('JWT') || error?.code === 'PGRST301') {
        throw new Error(`Authentication failed. Please reset your API Key via the sidebar.`);
    }
    throw new Error(error.message || `Failed to ${context}`);
};

// --- API Functions ---

// 1. Invoice Logic
export const getInvoices = async (): Promise<InvoiceData[]> => {
    if (isKeyMissing()) return []; // Prevent call if key is missing
    const { data, error } = await supabase.from('invoices').select('*');
    if (error) {
        if (isTableMissing(error)) {
            console.warn(`Table 'invoices' not found in Supabase. Returning empty list.`);
            return [];
        }
        handleSupabaseError(error, 'getInvoices');
    }
    return data as InvoiceData[];
};

export const generateNewMemoNumber = async (): Promise<string> => {
    if (isKeyMissing()) return 'SBT-001';
    // Fetch all memo numbers to calculate the next one. 
    // Optimization: In a real app, use .order() and .limit(1) if sorting logic permits, 
    // but fetching column only is acceptable for small datasets.
    const { data, error } = await supabase.from('invoices').select('trips_memo_no');
    if (error) {
        if (isTableMissing(error)) return 'SBT-001';
        handleSupabaseError(error, 'generateNewMemoNumber');
    }

    let maxNum = 0;
    (data || []).forEach((i: { trips_memo_no: string }) => {
        if (i.trips_memo_no && i.trips_memo_no.includes('-')) {
            const num = parseInt(i.trips_memo_no.split('-')[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
        }
    });
    return `SBT-${String(maxNum + 1).padStart(3, '0')}`;
};

export const saveInvoiceData = async (invoice: InvoiceData): Promise<string> => {
    // We use trips_memo_no as the unique key for updates
    const { error } = await supabase
        .from('invoices')
        .upsert(invoice, { onConflict: 'trips_memo_no' });
    
    if (error) handleSupabaseError(error, 'saveInvoiceData');
    return 'SUCCESS';
};

export const searchInvoiceByMemoNo = async (memoNo: string): Promise<InvoiceData | null> => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('trips_memo_no', memoNo)
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        if (isTableMissing(error)) return null; // Table missing
        handleSupabaseError(error, 'searchInvoiceByMemoNo');
    }
    return data as InvoiceData | null;
};

export const deleteInvoice = async (memoNo: string): Promise<void> => {
    const { error } = await supabase.from('invoices').delete().eq('trips_memo_no', memoNo);
    if (error) handleSupabaseError(error, 'deleteInvoice');
};


// 2. Customer Logic
export const getCustomers = async (): Promise<Customer[]> => {
    if (isKeyMissing()) return [];
    const { data, error } = await supabase.from('customers').select('*');
    if (error) {
        if (isTableMissing(error)) return [];
        handleSupabaseError(error, 'getCustomers');
    }
    return data as Customer[];
};

export const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<number> => {
    const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select('id')
        .single();
    
    if (error) handleSupabaseError(error, 'addCustomer');
    return data.id;
};

export const updateCustomer = async (customer: Customer): Promise<number> => {
    const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', customer.id)
        .select('id')
        .single();

    if (error) handleSupabaseError(error, 'updateCustomer');
    return data.id;
};

export const deleteCustomer = async (id: number): Promise<void> => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteCustomer');
};

export const updateCustomerAddresses = async (customerName: string): Promise<CustomerAddress[]> => {
    // Supabase allows 'ilike' for case-insensitive matching
    const { data, error } = await supabase
        .from('customers')
        .select('customers_address1, customers_address2')
        .ilike('customers_name', `%${customerName}%`);

    if (error) {
        if (isTableMissing(error)) return [];
        handleSupabaseError(error, 'updateCustomerAddresses');
    }
    
    return (data || []).map((c: any) => ({ 
        address1: c.customers_address1, 
        address2: c.customers_address2 
    }));
};


// 3. Areas Logic
export const getAreas = async (): Promise<Area[]> => {
    if (isKeyMissing()) return [];
    const { data, error } = await supabase.from('areas').select('*');
    if (error) {
        if (isTableMissing(error)) return [];
        handleSupabaseError(error, 'getAreas');
    }
    return data as Area[];
};

export const addArea = async (area: Omit<Area, 'id'>): Promise<number> => {
    const { data, error } = await supabase.from('areas').insert(area).select('id').single();
    if (error) handleSupabaseError(error, 'addArea');
    return data.id;
};

export const updateArea = async (area: Area): Promise<number> => {
    const { data, error } = await supabase.from('areas').update(area).eq('id', area.id).select('id').single();
    if (error) handleSupabaseError(error, 'updateArea');
    return data.id;
};

export const deleteArea = async (id: number): Promise<void> => {
    const { error } = await supabase.from('areas').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteArea');
};


// 4. Calculations Logic
export const getCalculations = async (): Promise<Calculation[]> => {
    if (isKeyMissing()) return [];
    const { data, error } = await supabase.from('calculations').select('*');
    if (error) {
        if (isTableMissing(error)) return [];
        handleSupabaseError(error, 'getCalculations');
    }
    return data as Calculation[];
};

export const addCalculationRecord = async (record: Omit<Calculation, 'id'>): Promise<number> => {
    const { data, error } = await supabase.from('calculations').insert(record).select('id').single();
    if (error) handleSupabaseError(error, 'addCalculationRecord');
    return data.id;
};

export const updateCalculationRecord = async (record: Calculation): Promise<number> => {
    const { data, error } = await supabase.from('calculations').update(record).eq('id', record.id).select('id').single();
    if (error) handleSupabaseError(error, 'updateCalculationRecord');
    return data.id;
};

export const deleteCalculationRecord = async (id: number): Promise<void> => {
    const { error } = await supabase.from('calculations').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteCalculationRecord');
};


// 5. Lookup Logic
export const getLookupData = async (): Promise<Lookup[]> => {
    if (isKeyMissing()) return [];
    const { data, error } = await supabase.from('lookup').select('*');
    if (error) {
        if (isTableMissing(error)) return [];
        handleSupabaseError(error, 'getLookupData');
    }
    return data as Lookup[];
};

export const addLookupRecord = async (record: Omit<Lookup, 'id'>): Promise<number> => {
    const { data, error } = await supabase.from('lookup').insert(record).select('id').single();
    if (error) handleSupabaseError(error, 'addLookupRecord');
    return data.id;
};

export const updateLookupRecord = async (record: Lookup): Promise<number> => {
    const { data, error } = await supabase.from('lookup').update(record).eq('id', record.id).select('id').single();
    if (error) handleSupabaseError(error, 'updateLookupRecord');
    return data.id;
};

export const deleteLookupRecord = async (id: number): Promise<void> => {
    const { error } = await supabase.from('lookup').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteLookupRecord');
};


// 6. View Services Logic (Aggregation)
export const getViewAllServicesData = async (): Promise<string[][]> => {
    if (isKeyMissing()) return [];
    // If tables are missing, these return empty arrays, which is safe.
    const [areas, calculations] = await Promise.all([getAreas(), getCalculations()]);
    
    const services: string[][] = [];
    
    // Cross-reference Areas and Calculations to generate available services.
    // Assuming a cross-join or that calculations apply to all areas based on usage patterns.
    for (const area of areas) {
        for (const calc of calculations) {
             const row = [
                area.locationArea,                          // 0
                area.locationCategory,                      // 1
                calc.products_type_category,                // 2: Vehicle Type / Category Name
                `${area.locationArea}-${calc.products_type_category}`, // 3: Product Item (ID)
                calc.products_minimum_hours,                // 4
                calc.products_minimum_km,                   // 5
                calc.products_minimum_charges,              // 6
                calc.products_additional_hours_charges,     // 7
                calc.products_running_hours,                // 8
                calc.products_driver_bata,                  // 9
                calc.products_type_category                 // 10: Vehicle Type (Raw)
            ];
            services.push(row);
        }
    }
    return services;
};


// 7. Database Import/Export
export const exportDb = async () => {
    if (isKeyMissing()) return {};
    const [invoices, customers, areas, calculations, lookup] = await Promise.all([
        getInvoices(),
        getCustomers(),
        getAreas(),
        getCalculations(),
        getLookupData()
    ]);
    return { invoices, customers, areas, calculations, lookup };
};

export const importDb = async (data: any) => {
    if (isKeyMissing()) return;
    
    const tryUpsert = async (table: string, rows: any[], conflictKey?: string) => {
        if (!rows || rows.length === 0) return;
        
        const options = conflictKey ? { onConflict: conflictKey } : undefined;
        const { error } = await supabase.from(table).upsert(rows, options);
        
        if (error) console.error(`Error importing ${table}:`, error);
    };

    if(data.invoices) await tryUpsert('invoices', data.invoices, 'trips_memo_no');
    if(data.customers) await tryUpsert('customers', data.customers); // uses id
    if(data.areas) await tryUpsert('areas', data.areas); // uses id
    if(data.calculations) await tryUpsert('calculations', data.calculations); // uses id
    if(data.lookup) await tryUpsert('lookup', data.lookup); // uses id
};
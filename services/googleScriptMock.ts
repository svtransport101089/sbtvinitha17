import { createClient } from '@supabase/supabase-js';
import { InvoiceData, Customer, CustomerAddress, Area, Calculation, Lookup } from '../types';
import { VEHICLE_TYPES } from '../constants';

// --- Supabase Configuration ---
const supabaseUrl = 'https://zcuxxugwmgoifmeahydl.supabase.co';
const STORAGE_KEY = 'sbt_transport_supabase_key';

// Safely access process.env or localStorage to get the key
const getSupabaseKey = () => {
    let key = '';
    try {
        // @ts-ignore
        if (typeof process !== 'undefined' && process.env && process.env.SUPABASE_KEY) {
            // @ts-ignore
            key = process.env.SUPABASE_KEY;
        }
    } catch (e) {
        // process is not defined in browser
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
const handleSupabaseError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    if (isKeyMissing()) {
        throw new Error(`Supabase Key is missing. Please enter your API Key in the prompt.`);
    }
    throw new Error(error.message || `Failed to ${context}`);
};

// --- API Functions ---

// 1. Invoice Logic
export const getInvoices = async (): Promise<InvoiceData[]> => {
    if (isKeyMissing()) return []; // Prevent call if key is missing
    const { data, error } = await supabase.from('invoices').select('*');
    if (error) handleSupabaseError(error, 'getInvoices');
    return data as InvoiceData[];
};

export const generateNewMemoNumber = async (): Promise<string> => {
    if (isKeyMissing()) return 'SBT-001';
    // Fetch all memo numbers to calculate the next one. 
    const { data, error } = await supabase.from('invoices').select('trips_memo_no');
    if (error) handleSupabaseError(error, 'generateNewMemoNumber');

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
    const { error } = await supabase
        .from('invoices')
        .upsert(invoice);
    
    if (error) handleSupabaseError(error, 'saveInvoiceData');
    return 'SUCCESS';
};

export const searchInvoiceByMemoNo = async (memoNo: string): Promise<InvoiceData | null> => {
    const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('trips_memo_no', memoNo)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
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
    if (error) handleSupabaseError(error, 'getCustomers');
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

    if (error) handleSupabaseError(error, 'updateCustomerAddresses');
    
    return (data || []).map((c: any) => ({ 
        address1: c.customers_address1, 
        address2: c.customers_address2 
    }));
};


// 3. Areas Logic
export const getAreas = async (): Promise<Area[]> => {
    if (isKeyMissing()) return [];
    const { data, error } = await supabase.from('areas').select('*');
    if (error) handleSupabaseError(error, 'getAreas');
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
    if (error) handleSupabaseError(error, 'getCalculations');
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
    if (error) handleSupabaseError(error, 'getLookupData');
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


// 6. View All Services (Calculated View)
export const getViewAllServicesData = async (): Promise<string[][]> => {
    if (isKeyMissing()) return [];
    // Fetch base data
    const areas = await getAreas();
    const calculations = await getCalculations();
    
    // In-memory join logic (same as before to preserve business logic without complex SQL views)
    const calculationMap = new Map<string, Calculation>();
    calculations.forEach(calc => calculationMap.set(calc.products_type_category, calc));
    
    const BRANDS = ["Transport", "VIKING"];

    const generatedData: string[][] = [];
    for (const area of areas) {
        for (const vehicleType of VEHICLE_TYPES) {
            for (const brand of BRANDS) {
                const lookupKey = `${brand}_${vehicleType}_${area.locationCategory}`;
                const calcData = calculationMap.get(lookupKey);
                
                if (calcData) {
                    const productItem = `${brand}_${area.locationCategory}_${area.locationArea}_${vehicleType}`.replace(/ /g, '_');
                    
                    let driverBata = calcData.products_driver_bata;
                    if (brand === 'VIKING' && area.locationArea !== 'Chengalpet') {
                        driverBata = '0';
                    }

                    generatedData.push([
                        area.locationArea,
                        area.locationCategory,
                        `${brand} - ${vehicleType}`,
                        productItem,
                        calcData.products_minimum_hours,
                        calcData.products_minimum_km,
                        calcData.products_minimum_charges,
                        calcData.products_additional_hours_charges,
                        calcData.products_running_hours,
                        driverBata,
                        vehicleType,
                    ]);
                }
            }
        }
    }
    return generatedData;
};


// 7. Database Import/Export
export const exportDb = async (): Promise<any> => {
    if (isKeyMissing()) throw new Error("Supabase Key missing");
    const tables = ['invoices', 'customers', 'areas', 'calculations', 'lookup'];
    const data: { [key: string]: any[] } = {};
    
    for (const table of tables) {
        const { data: tableData, error } = await supabase.from(table).select('*');
        if (error) throw new Error(`Failed to export ${table}: ${error.message}`);
        data[table] = tableData || [];
    }
    return data;
};

export const importDb = async (data: any): Promise<string> => {
    if (isKeyMissing()) throw new Error("Supabase Key missing");
    const tables = ['invoices', 'customers', 'areas', 'calculations', 'lookup'];
    
    // Basic validation
    if (!tables.every(name => data[name] && Array.isArray(data[name]))) {
        throw new Error("Invalid database file format or missing data.");
    }

    // Upsert data for each table
    for (const table of tables) {
        const rows = data[table];
        if (rows.length > 0) {
            const { error } = await supabase.from(table).upsert(rows);
            if (error) throw new Error(`Failed to import ${table}: ${error.message}`);
        }
    }
    
    return "Database imported successfully into Supabase.";
};
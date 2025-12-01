import { InvoiceData, Customer, CustomerAddress, Area, Calculation, Lookup } from '../types';
import { VEHICLE_TYPES } from '../constants';

// --- INITIAL MOCK DATA (for seeding the database on first load) ---
const initialInvoices: InvoiceData[] = [
    {
        trips_memo_no: 'SBT-001', trip_operated_date1: '2024-07-28', trip_upto_operated_date2: '',
        trips_vehicle_no: 'TN01AB1234', trips_vehicle_type: 'TATA ACE', customers_name: 'John Doe', customers_address1: '123 Main St', customers_address2: 'Anytown',
        trips_starting_time1: '09:00', trips_closing_time1: '13:00', trips_starting_time2: '', trips_closing_time2: '',
        trips_total_hours: '4.00', trips_startingKm1: '1000', trips_closingKm1: '1050', trips_startingKm2: '',
        trips_closingKm2: '', trips_totalKm: '50', products_item: 'TATA ACE', trips_minimum_hours1: '4',
        trips_minimum_charges1: '1000', products_item2: '', trips_minimum_hours2: '', trips_minimum_charges2: '',
        trips_extra_hours: '0.00', trips_for_additional_hour_rate: '200', trips_for_additional_hour_amt: '0',
        trips_fixed_amt_desc: 'Fixed Amount', trips_fixed_amt: '', trips_km: '50', trips_km_rate: '',
        trips_Km_amt: '0', trips_discount_percentage: '', trips_discount: '0', trips_driver_bata_qty: '',
        trips_driver_bata_rate: '', trips_driver_bata_amt: '', trips_toll_amt: '', trips_permit_amt: '',
        trips_night_hault_amt: '', trips_other_charges_desc: 'Other Charges', trips_other_charges_amt: '0',
        trips_total_amt: '1000', trips_less_advance: '500', trips_balance: '500',
        trips_total_amt_in_words: 'Five Hundred Rupees Only', trips_remark: ''
    }
];
const initialCustomers: Omit<Customer, 'id'>[] = [
    { customers_name: 'John Doe', customers_address1: '123 Main St', customers_address2: 'Anytown' },
    { customers_name: 'Jane Smith', customers_address1: '456 Oak Ave', customers_address2: 'Otherville' }
];
const initialAreasData: string[][] = [
    ["Local Trip", "Area 1"], ["Appolo Hospital", "Area 1"], ["Arumbakkam Bus Stand", "Area 1"],
    ["Guindy", "Area 1"], ["ICF", "Area 1"], ["Pambuputhu Koil", "Area 1"], ["Tandiarpet", "Area 1"],
    ["Vadapalani Bus Stand", "Area 1"], ["Velachery Pambu Puthu Koil", "Area 1"], ["Agaram", "Area 2"],
    ["Ambattur", "Area 2"], ["Erukanchery", "Area 2"], ["I.D Hospital", "Area 2"], ["Kandanchavadi", "Area 2"],
    ["Keelkattalai", "Area 2"], ["Kodungaiyur", "Area 2"], ["Kolapakkam", "Area 2"], ["Kolathur", "Area 2"],
    ["Kottivakkam", "Area 2"], ["M.K.B Nagar", "Area 2"], ["Madhavaram", "Area 2"], ["Madipakkam", "Area 2"],
    ["Maduvangarai", "Area 2"], ["Mettukuppam", "Area 2"], ["Moolakadai", "Area 2"], ["Nandambakkam", "Area 2"],
    ["Nerkundram", "Area 2"], ["Padi", "Area 2"], ["Palavakkam", "Area 2"], ["Pallavaram", "Area 2"],
    ["Peravallur", "Area 2"], ["Perungudi", "Area 2"], ["Porur", "Area 2"], ["Sembiam", "Area 2"],
    ["Thiruvanmiyur", "Area 2"], ["Thiruvotriyur", "Area 2"], ["Thoraipakkam", "Area 2"], ["Valasaravakkam", "Area 2"],
    ["Velachery", "Area 2"], ["Vijayanagaram", "Area 2"], ["Virugambakkam", "Area 2"], ["Akkarai", "Area 3"],
    ["Annanoore", "Area 3"], ["Athipedu", "Area 3"], ["Avadi", "Area 3"], ["Ayambekkam", "Area 3"],
    ["Ayappakkam", "Area 3"], ["Chitlapakkam", "Area 3"], ["Chrompet", "Area 3"], ["Ennore", "Area 3"],
    ["Girugambakkam", "Area 3"], ["Golden Beach (VGP)", "Area 3"], ["Injambakkam", "Area 3"], ["Kallikuppam", "Area 3"],
    ["Karapakkam", "Area 3"], ["Kattupakkam", "Area 3"], ["Manali", "Area 3"], ["Medavakkam", "Area 3"],
    ["Muthukaranchavadi", "Area 3"], ["Numbal", "Area 3"], ["Pallikaranai", "Area 3"], ["Pammal", "Area 3"],
    ["Perumbbakkam", "Area 3"], ["Poonamallee", "Area 3"], ["Puzhal", "Area 3"], ["Red Hills", "Area 3"],
    ["Solinganallur", "Area 3"], ["Sothupakkam", "Area 3"], ["Tambaram", "Area 3"], ["Vadaperumbakkam", "Area 3"],
    ["Vanagaram", "Area 3"], ["Vengaivasal", "Area 3"], ["Alamathi", "Area 4"], ["AvadiHVF", "Area 4"],
    ["Chembarambakkam", "Area 4"], ["Chemmanchery", "Area 4"], ["Cholavaram", "Area 4"], ["Kanathur", "Area 4"],
    ["Karanodai", "Area 4"], ["Kovur", "Area 4"], ["Kundrathur", "Area 4"], ["Meenjore", "Area 4"],
    ["Molavarpakkam", "Area 4"], ["Navalur", "Area 4"], ["Panchetty", "Area 4"], ["Pattabiram", "Area 4"],
    ["Ponmar", "Area 4"], ["Thirumazhisai", "Area 4"], ["Thiruvallur-1", "Area 4"], ["Urapakkam", "Area 4"],
    ["Uthandi", "Area 4"], ["Vallamedu", "Area 4"], ["Vandalur", "Area 4"], ["Vaniyanchavadi", "Area 4"],
    ["Vengal Kuttu Road", "Area 4"], ["Athipattu", "Area 5"], ["Azhingivakkam", "Area 5"], ["Guduvanchery", "Area 5"],
    ["Kakalur", "Area 5"], ["Kandigai", "Area 5"], ["Kelambakkam", "Area 5"], ["Kovalam", "Area 5"],
    ["Manimangalam", "Area 5"], ["Muttukadu", "Area 5"], ["Nemilichery", "Area 5"], ["Padappai", "Area 5"],
    ["Padur", "Area 5"], ["Paruthipattu", "Area 5"], ["Ponneri", "Area 5"], ["Poochi Athipedu", "Area 5"],
    ["Shevapet", "Area 5"], ["Urakkadu", "Area 5"], ["Vengal", "Area 5"], ["Alathur", "Area 6"],
    ["Gummidipoondi", "Area 6"], ["Kavarapet", "Area 6"], ["Maraimalai Nagar", "Area 6"], ["Periyapalayam", "Area 6"],
    ["Puduvoyal", "Area 6"], ["Sengadu", "Area 6"], ["Singaperumal Koil", "Area 6"], ["Sriperumbathur", "Area 6"],
    ["Thiruporur", "Area 6"], ["Thiruvallur", "Area 6"], ["Vadanemili", "Area 6"], ["Vallam", "Area 6"],
    ["Chengalpet", "Area 7"], ["Elaavur", "Area 7"], ["Madharpakkam", "Area 7"], ["Mahabalipuram", "Area 7"],
    ["Oragadam", "Area 7"], ["Pazhaverkadu", "Area 7"], ["Poondi", "Area 7"], ["Sunguvachathiram", "Area 7"],
    ["Ulandai", "Area 7"], ["Arambakkam", "Area 8"], ["Kalpakkam", "Area 8"], ["Kancheepuram", "Area 8"],
    ["Poonur", "Area 8"], ["Pukkathurai", "Area 8"], ["Thiruvelangadu", "Area 8"], ["Uthukottai", "Area 8"],
    ["Arakkonam", "Area 9"], ["Maduranthagam", "Area 9"], ["Serampalayam", "Area 9"], ["Thiruthani", "Area 9"],
    ["Manjampakkam", "Area 3"], ["Alandur", "Area 2"], ["Thirumudivakkam", "Area 4"], ["Anakaputhur", "Area 3"],
    ["Walajabad", "Area 7"]
];
const initialCalculationsData: string[][] = [
    ["products_type_category", "products_minimum_hours", "products_minimum_km", "products_minimum_charges", "products_additional_hours_charges", "products_running_hours", "products_driver_bata"],
    ["Transport_1000 Kg_Area 1", "2", "20", "600", "180", "0", "25"],
    ["Transport_2000 Kg_Area 1", "2", "20", "900", "200", "0", "25"],
    ["Transport_3000 Kg_Area 1", "2", "20", "1000", "220", "0", "25"],
    ["Transport_DCM Toyota_Area 1", "2", "20", "1200", "260", "0", "25"],
    ["Transport_17 Feet_Area 1", "2", "20", "1350", "300", "0", "25"],
    ["Transport_20 Feet_Area 1", "2", "20", "1450", "320", "0", "25"],
    ["Transport_1000 Kg_Area 2", "2", "30", "800", "180", "1", "25"],
    ["Transport_2000 Kg_Area 2", "2", "30", "1000", "200", "1", "25"],
    ["Transport_3000 Kg_Area 2", "2", "30", "1100", "220", "1", "25"],
    ["Transport_DCM Toyota_Area 2", "2", "30", "1350", "260", "1", "25"],
    ["Transport_17 Feet_Area 2", "2", "30", "1550", "300", "1", "25"],
    ["Transport_20 Feet_Area 2", "2", "30", "1650", "320", "1", "25"],
    ["Transport_1000 Kg_Area 3", "2", "50", "1000", "180", "1.25", "25"],
    ["Transport_2000 Kg_Area 3", "2", "50", "1300", "200", "1.25", "25"],
    ["Transport_3000 Kg_Area 3", "2", "50", "1400", "220", "1.25", "25"],
    ["Transport_DCM Toyota_Area 3", "2", "50", "1500", "260", "1.25", "25"],
    ["Transport_17 Feet_Area 3", "2", "50", "1750", "300", "1.25", "25"],
    ["Transport_20 Feet_Area 3", "2", "50", "1850", "320", "1.25", "25"],
    ["Transport_1000 Kg_Area 4", "3.5", "70", "1300", "180", "1.5", "25"],
    ["Transport_2000 Kg_Area 4", "3.5", "70", "1700", "200", "1.5", "25"],
    ["Transport_3000 Kg_Area 4", "3.5", "70", "1900", "220", "1.5", "25"],
    ["Transport_DCM Toyota_Area 4", "3.5", "70", "2200", "260", "1.5", "25"],
    ["Transport_17 Feet_Area 4", "3.5", "70", "2400", "300", "1.5", "25"],
    ["Transport_20 Feet_Area 4", "3.5", "70", "2600", "320", "1.5", "25"],
    ["Transport_1000 Kg_Area 5", "4.5", "80", "1500", "180", "1.75", "25"],
    ["Transport_2000 Kg_Area 5", "4.5", "80", "2000", "200", "1.75", "25"],
    ["Transport_3000 Kg_Area 5", "4.5", "80", "2200", "220", "1.75", "25"],
    ["Transport_DCM Toyota_Area 5", "4.5", "80", "2500", "260", "1.75", "25"],
    ["Transport_17 Feet_Area 5", "4.5", "80", "2800", "300", "1.75", "25"],
    ["Transport_20 Feet_Area 5", "4.5", "80", "3000", "320", "1.75", "25"],
    ["Transport_1000 Kg_Area 6", "5", "90", "1700", "180", "2", "25"],
    ["Transport_2000 Kg_Area 6", "5", "90", "2200", "200", "2", "25"],
    ["Transport_3000 Kg_Area 6", "5", "90", "2400", "220", "2", "25"],
    ["Transport_DCM Toyota_Area 6", "5", "90", "2700", "260", "2", "25"],
    ["Transport_17 Feet_Area 6", "5", "90", "3000", "300", "2", "25"],
    ["Transport_20 Feet_Area 6", "5", "90", "3200", "320", "2", "25"],
    ["Transport_1000 Kg_Area 7", "5.5", "110", "1900", "180", "2.5", "25"],
    ["Transport_2000 Kg_Area 7", "5.5", "110", "2500", "200", "2.5", "25"],
    ["Transport_3000 Kg_Area 7", "5.5", "110", "2750", "220", "2.5", "25"],
    ["Transport_DCM Toyota_Area 7", "5.5", "110", "3200", "260", "2.5", "25"],
    ["Transport_17 Feet_Area 7", "5.5", "110", "3500", "300", "2.5", "25"],
    ["Transport_20 Feet_Area 7", "5.5", "110", "3700", "320", "2.5", "25"],
    ["Transport_1000 Kg_Area 8", "6", "150", "2300", "180", "3", "25"],
    ["Transport_2000 Kg_Area 8", "6", "150", "2900", "200", "3", "25"],
    ["Transport_3000 Kg_Area 8", "6", "150", "3200", "220", "3", "25"],
    ["Transport_DCM Toyota_Area 8", "6", "150", "3600", "260", "3", "25"],
    ["Transport_17 Feet_Area 8", "6", "150", "4200", "300", "3", "25"],
    ["Transport_20 Feet_Area 8", "6", "150", "4400", "320", "3", "25"],
    ["Transport_1000 Kg_Area 9", "8", "200", "2800", "180", "3.5", "25"],
    ["Transport_2000 Kg_Area 9", "8", "200", "3700", "200", "3.5", "25"],
    ["Transport_3000 Kg_Area 9", "8", "200", "4100", "220", "3.5", "25"],
    ["Transport_DCM Toyota_Area 9", "8", "200", "4500", "260", "3.5", "25"],
    ["Transport_17 Feet_Area 9", "8", "200", "5200", "300", "3.5", "25"],
    ["Transport_20 Feet_Area 9", "8", "200", "5400", "320", "3.5", "25"],
    ["VIKING_17 Feet_Area 1", "2", "20", "1250", "300", "0", "25"],
    ["VIKING_17 Feet_Area 2", "2", "30", "1450", "300", "1", "25"],
    ["VIKING_17 Feet_Area 3", "2", "50", "1650", "300", "1.25", "25"],
    ["VIKING_17 Feet_Area 4", "3.5", "70", "2200", "300", "1.5", "25"],
    ["VIKING_17 Feet_Area 5", "4.5", "80", "2600", "300", "1.75", "25"],
    ["VIKING_17 Feet_Area 6", "5", "90", "2800", "300", "2", "25"],
    ["VIKING_17 Feet_Area 7", "5.5", "110", "3500", "300", "2.5", "25"],
    ["VIKING_17 Feet_Area 8", "6", "150", "3400", "300", "3", "25"],
    ["VIKING_17 Feet_Area 9", "8", "200", "4100", "300", "3.5", "25"],
    ["VIKING_20 Feet_Area 1", "2", "20", "0", "320", "0", "25"],
    ["VIKING_20 Feet_Area 2", "2", "30", "0", "320", "1", "25"],
    ["VIKING_20 Feet_Area 3", "2", "50", "0", "320", "1.25", "25"],
    ["VIKING_20 Feet_Area 4", "3.5", "70", "0", "320", "1.5", "25"],
    ["VIKING_20 Feet_Area 5", "4.5", "80", "0", "320", "1.75", "25"],
    ["VIKING_20 Feet_Area 6", "5", "90", "0", "320", "2", "25"],
    ["VIKING_20 Feet_Area 7", "5.5", "110", "0", "320", "2.5", "25"],
    ["VIKING_20 Feet_Area 8", "6", "150", "0", "320", "3", "25"],
    ["VIKING_20 Feet_Area 9", "8", "200", "0", "320", "3.5", "25"],
    ["VIKING_407_Area 1", "2", "20", "900", "200", "0", "25"],
    ["VIKING_407_Area 2", "2", "30", "1000", "200", "1", "25"],
    ["VIKING_407_Area 3", "2", "50", "1250", "200", "1.25", "25"],
    ["VIKING_407_Area 4", "3.5", "70", "1700", "200", "1.5", "25"],
    ["VIKING_407_Area 5", "4.5", "80", "2000", "200", "1.75", "25"],
    ["VIKING_407_Area 6", "5", "90", "2200", "200", "2", "25"],
    ["VIKING_407_Area 7", "5.5", "110", "2750", "220", "2.5", "25"],
    ["VIKING_407_Area 8", "6", "150", "2700", "200", "3", "25"],
    ["VIKING_407_Area 9", "8", "200", "3400", "200", "3.5", "25"],
    ["VIKING_DCM Toyota_Area 1", "2", "20", "1100", "260", "0", "25"],
    ["VIKING_DCM Toyota_Area 2", "2", "30", "1250", "260", "1", "25"],
    ["VIKING_DCM Toyota_Area 3", "2", "50", "1400", "260", "1.25", "25"],
    ["VIKING_DCM Toyota_Area 4", "3.5", "70", "1900", "260", "1.5", "25"],
    ["VIKING_DCM Toyota_Area 5", "4.5", "80", "2200", "260", "1.75", "25"],
    ["VIKING_DCM Toyota_Area 6", "5", "90", "2500", "260", "2", "25"],
    ["VIKING_DCM Toyota_Area 7", "5.5", "110", "3200", "260", "2.5", "25"],
    ["VIKING_DCM Toyota_Area 8", "6", "150", "3100", "260", "3", "25"],
    ["VIKING_DCM Toyota_Area 9", "8", "200", "3700", "260", "3.5", "25"],
    ["VIKING_DOST_Area 1", "2", "20", "800", "180", "0", "25"],
    ["VIKING_DOST_Area 2", "2", "30", "900", "180", "1", "25"],
    ["VIKING_DOST_Area 3", "2", "50", "1200", "180", "1.25", "25"],
    ["VIKING_DOST_Area 4", "3.5", "70", "1600", "180", "1.5", "25"],
    ["VIKING_DOST_Area 5", "4.5", "80", "1800", "180", "1.75", "25"],
    ["VIKING_DOST_Area 6", "5", "90", "2000", "180", "2", "25"],
    ["VIKING_DOST_Area 7", "5.5", "110", "2500", "200", "2.5", "25"],
    ["VIKING_DOST_Area 8", "6", "150", "2500", "180", "3", "25"],
    ["VIKING_DOST_Area 9", "8", "200", "3200", "180", "3.5", "25"],
    ["VIKING_TATA ACE_Area 1", "2", "20", "600", "160", "0", "25"],
    ["VIKING_TATA ACE_Area 2", "2", "30", "800", "160", "1", "25"],
    ["VIKING_TATA ACE_Area 3", "2", "50", "1000", "160", "1.25", "25"],
    ["VIKING_TATA ACE_Area 4", "3.5", "70", "1300", "160", "1.5", "25"],
    ["VIKING_TATA ACE_Area 5", "4.5", "80", "1500", "160", "1.75", "25"],
    ["VIKING_TATA ACE_Area 6", "5", "90", "1700", "160", "2", "25"],
    ["VIKING_TATA ACE_Area 7", "5.5", "110", "1900", "180", "2.5", "25"],
    ["VIKING_TATA ACE_Area 8", "6", "150", "2300", "160", "3", "25"],
    ["VIKING_TATA ACE_Area 9", "8", "200", "2300", "160", "3.5", "25"]
];
const initialLookupData: string[][] = [
    ["driver_name", "license_number", "phone"],
    ["Ramesh", "TN-01-A-1234", "9876543210"],
    ["Kumar", "TN-02-B-5678", "9876543211"],
];

// --- Database Service (IndexedDB) ---
const DB_NAME = 'SBT_AdminDB';
const DB_VERSION = 1;
let db: IDBDatabase | null = null;

// FIX: Define an interface for object store options to ensure type safety.
interface ObjectStoreOptions {
    keyPath: string;
    autoIncrement?: boolean;
}

const objectStores: Record<string, ObjectStoreOptions> = {
    invoices: { keyPath: 'trips_memo_no' },
    customers: { keyPath: 'id', autoIncrement: true },
    areas: { keyPath: 'id', autoIncrement: true },
    calculations: { keyPath: 'id', autoIncrement: true },
    lookup: { keyPath: 'id', autoIncrement: true },
};

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Database error:", request.error);
            reject("Database error");
        };

        request.onsuccess = (event) => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            for (const [storeName, options] of Object.entries(objectStores)) {
                if (!tempDb.objectStoreNames.contains(storeName)) {
                    tempDb.createObjectStore(storeName, options);
                }
            }

            // Seeding logic after stores are created
            const tx = (event.target as any).transaction;
            
            // Seed Invoices
            const invoiceStore = tx.objectStore('invoices');
            initialInvoices.forEach(item => invoiceStore.add(item));

            // Seed Customers
            const customerStore = tx.objectStore('customers');
            initialCustomers.forEach(item => customerStore.add(item));
            
            // Seed Areas
            const areaStore = tx.objectStore('areas');
            initialAreasData.forEach(row => areaStore.add({ locationArea: row[0], locationCategory: row[1] }));
            
            // Seed Calculations
            const calculationStore = tx.objectStore('calculations');
            const calcHeaders = initialCalculationsData[0];
            initialCalculationsData.slice(1).forEach(row => {
                const record: { [key: string]: string } = {};
                calcHeaders.forEach((header, i) => record[header] = row[i]);
                calculationStore.add(record);
            });
            
            // Seed Lookup
            const lookupStore = tx.objectStore('lookup');
            const lookupHeaders = initialLookupData[0];
            initialLookupData.slice(1).forEach(row => {
                const record: { [key: string]: string } = {};
                lookupHeaders.forEach((header, i) => record[header] = row[i]);
                lookupStore.add(record);
            });
        };
    });
};

const dbRequest = <T>(storeName: keyof typeof objectStores, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> => {
    return initDB().then(db => {
        return new Promise<T>((resolve, reject) => {
            const transaction = db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = action(store);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result as T);
        });
    });
};


// --- API Functions ---

export const generateNewMemoNumber = async (): Promise<string> => {
    const invoices = await getInvoices();
    let maxNum = 0;
    invoices.forEach(i => {
        if (i.trips_memo_no && i.trips_memo_no.includes('-')) {
            const num = parseInt(i.trips_memo_no.split('-')[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
        }
    });
    return `SBT-${String(maxNum + 1).padStart(3, '0')}`;
};

export const updateCustomerAddresses = async (customerName: string): Promise<CustomerAddress[]> => {
    const customers = await getCustomers();
    return customers
        .filter(c => c.customers_name.toLowerCase().includes(customerName.toLowerCase()))
        .map(c => ({ address1: c.customers_address1, address2: c.customers_address2 }));
};

// Customer CRUD
export const getCustomers = (): Promise<Customer[]> => dbRequest('customers', 'readonly', store => store.getAll());
export const addCustomer = (customer: Omit<Customer, 'id'>): Promise<number> => dbRequest('customers', 'readwrite', store => store.add(customer));
export const updateCustomer = (customer: Customer): Promise<number> => dbRequest('customers', 'readwrite', store => store.put(customer));
export const deleteCustomer = (id: number): Promise<void> => dbRequest('customers', 'readwrite', store => store.delete(id));

// Invoice CRUD
export const saveInvoiceData = (invoice: InvoiceData): Promise<string> => dbRequest('invoices', 'readwrite', store => store.put(invoice)).then(() => 'SUCCESS');
export const searchInvoiceByMemoNo = (memoNo: string): Promise<InvoiceData | null> => dbRequest('invoices', 'readonly', store => store.get(memoNo));
export const getInvoices = (): Promise<InvoiceData[]> => dbRequest('invoices', 'readonly', store => store.getAll());
export const deleteInvoice = (memoNo: string): Promise<void> => dbRequest('invoices', 'readwrite', store => store.delete(memoNo));

// Areas CRUD
export const getAreas = (): Promise<Area[]> => dbRequest('areas', 'readonly', store => store.getAll());
export const addArea = (area: Omit<Area, 'id'>): Promise<number> => dbRequest('areas', 'readwrite', store => store.add(area));
export const updateArea = (area: Area): Promise<number> => dbRequest('areas', 'readwrite', store => store.put(area));
export const deleteArea = (id: number): Promise<void> => dbRequest('areas', 'readwrite', store => store.delete(id));

// Calculations CRUD
export const getCalculations = (): Promise<Calculation[]> => dbRequest('calculations', 'readonly', store => store.getAll());
export const addCalculationRecord = (record: Omit<Calculation, 'id'>): Promise<number> => dbRequest('calculations', 'readwrite', store => store.add(record));
export const updateCalculationRecord = (record: Calculation): Promise<number> => dbRequest('calculations', 'readwrite', store => store.put(record));
export const deleteCalculationRecord = (id: number): Promise<void> => dbRequest('calculations', 'readwrite', store => store.delete(id));

// Lookup CRUD
export const getLookupData = (): Promise<Lookup[]> => dbRequest('lookup', 'readonly', store => store.getAll());
export const addLookupRecord = (record: Omit<Lookup, 'id'>): Promise<number> => dbRequest('lookup', 'readwrite', store => store.add(record));
export const updateLookupRecord = (record: Lookup): Promise<number> => dbRequest('lookup', 'readwrite', store => store.put(record));
export const deleteLookupRecord = (id: number): Promise<void> => dbRequest('lookup', 'readwrite', store => store.delete(id));

// View All Services
export const getViewAllServicesData = async (): Promise<string[][]> => {
    const areas = await getAreas();
    const calculations = await getCalculations();
    
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
                        vehicleType, // Raw vehicle type
                    ]);
                }
            }
        }
    }
    return generatedData;
};

// Database Import/Export
export const exportDb = async (): Promise<any> => {
    const data: { [key: string]: any[] } = {};
    for (const storeName of Object.keys(objectStores)) {
        data[storeName] = await dbRequest(storeName as keyof typeof objectStores, 'readonly', store => store.getAll());
    }
    return data;
};

export const importDb = async (data: any): Promise<string> => {
    const db = await initDB();
    const storeNames = Object.keys(objectStores);
    
    // Basic validation
    if (!storeNames.every(name => data[name] && Array.isArray(data[name]))) {
        throw new Error("Invalid database file format or missing data.");
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeNames, 'readwrite');
        transaction.onerror = (event) => reject(transaction.error);
        transaction.oncomplete = (event) => resolve("Database imported successfully.");

        for (const storeName of storeNames) {
            const store = transaction.objectStore(storeName);
            store.clear();
            for (const item of data[storeName]) {
                // Remove ID for auto-increment stores on import to avoid constraint errors
                // FIX: Use the typed objectStores object, which makes this check type-safe.
                if (objectStores[storeName].autoIncrement) {
                    delete item.id;
                }
                store.add(item);
            }
        }
    });
};
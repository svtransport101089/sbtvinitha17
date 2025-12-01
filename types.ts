export enum Page {
    DASHBOARD = 'DASHBOARD',
    INVOICE = 'INVOICE',
    MANAGE_INVOICES = 'MANAGE_INVOICES',
    MANAGE_CUSTOMERS = 'MANAGE_CUSTOMERS',
    VIEW_ALL_SERVICES = 'VIEW_ALL_SERVICES',
    MANAGE_AREAS = 'MANAGE_AREAS',
    MANAGE_CALCULATIONS = 'MANAGE_CALCULATIONS',
    MANAGE_LOOKUP = 'MANAGE_LOOKUP',
}

export interface Customer {
    id?: number;
    customers_name: string;
    customers_address1: string;
    customers_address2: string;
}

export interface Area {
    id?: number;
    locationArea: string;
    locationCategory: string;
}

export interface Calculation {
    id?: number;
    products_type_category: string,
    products_minimum_hours: string,
    products_minimum_km: string,
    products_minimum_charges: string,
    products_additional_hours_charges: string,
    products_running_hours: string,
    products_driver_bata: string
}

export interface Lookup {
    id?: number;
    driver_name: string;
    license_number: string;
    phone: string;
}


export interface CustomerAddress {
    address1: string;
    address2: string;
}

export interface Rates {
    minimumHours: number;
    minimumCharges: number;
    additionalHourRate: number;
}

export interface InvoiceData {
    trips_memo_no: string;
    trip_operated_date1: string;
    trip_upto_operated_date2: string;
    trips_vehicle_no: string;
    trips_vehicle_type: string;
    customers_name: string;
    customers_address1: string;
    customers_address2: string;
    
    trips_starting_time1: string;
    trips_closing_time1: string;
    trips_starting_time2: string;
    trips_closing_time2: string;
    trips_total_hours: string;
    
    trips_startingKm1: string;
    trips_closingKm1: string;
    trips_startingKm2: string;
    trips_closingKm2: string;
    trips_totalKm: string;
    
    products_item: string;
    trips_minimum_hours1: string;
    trips_minimum_charges1: string;
    
    products_item2: string;
    trips_minimum_hours2: string;
    trips_minimum_charges2: string;

    trips_extra_hours: string;
    trips_for_additional_hour_rate: string;
    trips_for_additional_hour_amt: string;

    trips_fixed_amt_desc: string;
    trips_fixed_amt: string;

    trips_km: string;
    trips_km_rate: string;
    trips_Km_amt: string;

    trips_discount_percentage: string;
    trips_discount: string;

    trips_driver_bata_qty: string;
    trips_driver_bata_rate: string;
    trips_driver_bata_amt: string;

    trips_toll_amt: string;
    trips_permit_amt: string;
    trips_night_hault_amt: string;

    trips_other_charges_desc: string;
    trips_other_charges_amt: string;

    trips_total_amt: string;
    trips_less_advance: string;
    trips_balance: string;
    trips_total_amt_in_words: string;
    trips_remark: string;
}
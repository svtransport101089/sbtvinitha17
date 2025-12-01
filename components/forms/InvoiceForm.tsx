import React, { useState, useEffect, useCallback } from 'react';
import { InvoiceData } from '../../types';
import {
    generateNewMemoNumber,
    saveInvoiceData,
    searchInvoiceByMemoNo,
    getCustomers,
    updateCustomerAddresses,
    getViewAllServicesData,
} from '../../services/googleScriptMock';
import { useToast } from '../../hooks/useToast';
import { numberToWords } from '../../utils/numberToWords';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import ComboBox from '../ui/ComboBox';

const initialInvoiceState: InvoiceData = {
    trips_memo_no: '',
    trip_operated_date1: new Date().toISOString().split('T')[0],
    trip_upto_operated_date2: '',
    trips_vehicle_no: '',
    trips_vehicle_type: '',
    customers_name: '',
    customers_address1: '',
    customers_address2: '',
    trips_starting_time1: '',
    trips_closing_time1: '',
    trips_starting_time2: '',
    trips_closing_time2: '',
    trips_total_hours: '0',
    trips_startingKm1: '0',
    trips_closingKm1: '0',
    trips_startingKm2: '0',
    trips_closingKm2: '0',
    trips_totalKm: '0',
    products_item: '',
    trips_minimum_hours1: '0',
    trips_minimum_charges1: '0',
    products_item2: '',
    trips_minimum_hours2: '0',
    trips_minimum_charges2: '0',
    trips_extra_hours: '0',
    trips_for_additional_hour_rate: '0',
    trips_for_additional_hour_amt: '0',
    trips_fixed_amt_desc: 'Fixed Amount',
    trips_fixed_amt: '0',
    trips_km: '0',
    trips_km_rate: '0',
    trips_Km_amt: '0',
    trips_discount_percentage: '0',
    trips_discount: '0',
    trips_driver_bata_qty: '0',
    trips_driver_bata_rate: '0',
    trips_driver_bata_amt: '0',
    trips_toll_amt: '0',
    trips_permit_amt: '0',
    trips_night_hault_amt: '0',
    trips_other_charges_desc: 'Other Charges',
    trips_other_charges_amt: '0',
    trips_total_amt: '0',
    trips_less_advance: '0',
    trips_balance: '0',
    trips_total_amt_in_words: '',
    trips_remark: '',
};

interface InvoiceFormProps {
    invoiceMemoToLoad: string | null;
    onSaveSuccess: () => void;
    onCancel: () => void;
    printOnLoad?: boolean;
    onPrinted?: () => void;
}

const InvoiceInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`p-1 border border-gray-400 rounded-sm w-full text-sm font-bold read-only:bg-gray-200 disabled:bg-gray-200 ${props.className}`} />
);

const InvoiceTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea {...props} className={`p-1 border border-gray-400 rounded-sm w-full text-sm font-bold read-only:bg-gray-200 ${props.className}`} />
);


const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceMemoToLoad, onSaveSuccess, onCancel, printOnLoad = false, onPrinted = () => {} }) => {
    const [invoiceData, setInvoiceData] = useState<InvoiceData>(initialInvoiceState);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [customerNames, setCustomerNames] = useState<string[]>([]);
    const [services, setServices] = useState<string[][]>([]);
    const { addToast } = useToast();

    const calculateTotals = useCallback(() => {
        setInvoiceData(prev => {
            const p = (v: string | number) => parseFloat(String(v)) || 0;

            const calculateHours = (start: string, end: string) => {
                if (!start || !end) return 0;
                const [startH, startM] = start.split(':').map(Number);
                const [endH, endM] = end.split(':').map(Number);
                if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
                let startMinutes = startH * 60 + startM;
                let endMinutes = endH * 60 + endM;
                if (endMinutes < startMinutes) endMinutes += 24 * 60;
                return (endMinutes - startMinutes) / 60;
            };

            const hours1 = calculateHours(prev.trips_starting_time1, prev.trips_closing_time1);
            const hours2 = calculateHours(prev.trips_starting_time2, prev.trips_closing_time2);
            const totalHours = parseFloat((hours1 + hours2).toFixed(2));
            const driverBataQty = Math.ceil(totalHours);

            const totalKm = (p(prev.trips_closingKm1) - p(prev.trips_startingKm1)) + (p(prev.trips_closingKm2) - p(prev.trips_startingKm2));

            const extraHours = Math.max(0, totalHours - p(prev.trips_minimum_hours1) - p(prev.trips_minimum_hours2));
            const extraHourAmt = extraHours * p(prev.trips_for_additional_hour_rate);

            const kmAmt = totalKm * p(prev.trips_km_rate);
            const driverBataAmt = driverBataQty * p(prev.trips_driver_bata_rate);

            const subTotal = p(prev.trips_minimum_charges1) + p(prev.trips_minimum_charges2) + extraHourAmt + kmAmt + driverBataAmt +
                p(prev.trips_fixed_amt) + p(prev.trips_toll_amt) + p(prev.trips_permit_amt) + p(prev.trips_night_hault_amt) + p(prev.trips_other_charges_amt);
            
            const discountAmt = subTotal * (p(prev.trips_discount_percentage) / 100);
            const totalAmt = subTotal - discountAmt;
            const balance = totalAmt - p(prev.trips_less_advance);

            return {
                ...prev,
                trips_total_hours: String(totalHours),
                trips_driver_bata_qty: String(driverBataQty),
                trips_totalKm: String(totalKm),
                trips_km: String(totalKm),
                trips_extra_hours: String(extraHours.toFixed(2)),
                trips_for_additional_hour_amt: String(extraHourAmt.toFixed(0)),
                trips_Km_amt: String(kmAmt.toFixed(2)),
                trips_driver_bata_amt: String(driverBataAmt.toFixed(2)),
                trips_discount: String(discountAmt.toFixed(2)),
                trips_total_amt: String(totalAmt.toFixed(2)),
                trips_balance: String(balance.toFixed(2)),
                trips_total_amt_in_words: numberToWords(Math.round(totalAmt)),
            };
        });
    }, []);

    useEffect(() => {
        calculateTotals();
    }, [
        calculateTotals, invoiceData.trips_starting_time1, invoiceData.trips_closing_time1,
        invoiceData.trips_starting_time2, invoiceData.trips_closing_time2, invoiceData.trips_startingKm1,
        invoiceData.trips_closingKm1, invoiceData.trips_startingKm2, invoiceData.trips_closingKm2,
        invoiceData.trips_minimum_hours1, invoiceData.trips_minimum_hours2, invoiceData.trips_minimum_charges1, 
        invoiceData.trips_minimum_charges2, invoiceData.trips_for_additional_hour_rate, invoiceData.trips_km_rate,
        invoiceData.trips_driver_bata_rate, invoiceData.trips_fixed_amt,
        invoiceData.trips_toll_amt, invoiceData.trips_permit_amt, invoiceData.trips_night_hault_amt,
        invoiceData.trips_other_charges_amt, invoiceData.trips_discount_percentage, invoiceData.trips_less_advance,
    ]);


    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const customerData = await getCustomers();
                setCustomerNames(customerData.map(c => c.customers_name));

                const servicesData = await getViewAllServicesData();
                setServices(servicesData);

                if (invoiceMemoToLoad) {
                    const data = await searchInvoiceByMemoNo(invoiceMemoToLoad);
                    if (data) {
                        setInvoiceData(data);
                    } else {
                        addToast(`Invoice ${invoiceMemoToLoad} not found.`, 'error');
                        onCancel();
                    }
                } else {
                    const memoNo = await generateNewMemoNumber();
                    setInvoiceData(prev => ({ ...initialInvoiceState, trips_memo_no: memoNo, trip_operated_date1: new Date().toISOString().split('T')[0] }));
                }
            } catch (error) {
                addToast('Failed to load initial data.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [invoiceMemoToLoad, addToast, onCancel]);

    useEffect(() => {
        if (!isLoading && printOnLoad) {
            const handleAfterPrint = () => {
                // Remove the listener to prevent memory leaks.
                window.removeEventListener('afterprint', handleAfterPrint);
                
                // A race condition can occur where navigating away immediately interrupts
                // the browser's PDF generation. A small delay ensures it completes.
                setTimeout(() => {
                    onPrinted();
                }, 100);
            };
            
            window.addEventListener('afterprint', handleAfterPrint);

            // A timeout ensures the DOM is fully rendered before triggering the print dialog.
            const printTimer = setTimeout(() => {
                window.print();
            }, 300);

            // Cleanup if the component unmounts before printing.
            return () => {
                clearTimeout(printTimer);
                window.removeEventListener('afterprint', handleAfterPrint);
            };
        }
    }, [isLoading, printOnLoad, onPrinted]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInvoiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleCustomerNameChange = async (name: string) => {
        const newDiscount = name.toLowerCase().includes('transport') ? '10' : '0';

        let newAddress = { customers_address1: '', customers_address2: '' };
        try {
            const addresses = await updateCustomerAddresses(name);
            if (addresses.length > 0) {
                newAddress = {
                    customers_address1: addresses[0].address1,
                    customers_address2: addresses[0].address2,
                };
            }
        } catch (error) {
           console.error("Failed to fetch customer addresses", error);
        }

        setInvoiceData(prev => ({
            ...prev,
            customers_name: name,
            trips_discount_percentage: newDiscount,
            ...newAddress
        }));
    };
    
    const handleServiceChange = (productItem: string) => {
        const selectedService = services.find(service => service[3] === productItem);

        if (selectedService) {
            const [
                _locationArea, // 0
                _locationCategory, // 1
                _vehicleTypeDisplay, // 2
                _productItem, // 3
                minHours, // 4
                _minKM, // 5
                minCharges, // 6
                addHourCharge, // 7
                _runningHours, // 8
                driverBata, // 9
                vehicleType, // 10
            ] = selectedService;

            setInvoiceData(prev => ({
                ...prev,
                products_item: productItem,
                trips_vehicle_type: vehicleType,
                trips_minimum_hours1: minHours,
                trips_minimum_charges1: minCharges,
                trips_for_additional_hour_rate: addHourCharge,
                trips_driver_bata_rate: driverBata || '0',
            }));
        } else {
             setInvoiceData(prev => ({
                ...prev,
                products_item: '',
                trips_vehicle_type: '',
                trips_minimum_hours1: '0',
                trips_minimum_charges1: '0',
                trips_for_additional_hour_rate: '0',
                trips_driver_bata_rate: '0',
            }));
        }
    };

    const handleServiceChange2 = (productItem: string) => {
        const selectedService = services.find(service => service[3] === productItem);

        if (selectedService) {
            const [ , , , , minHours, , minCharges ] = selectedService;

            setInvoiceData(prev => ({
                ...prev,
                products_item2: productItem,
                trips_minimum_hours2: minHours,
                trips_minimum_charges2: minCharges,
            }));
        } else {
             setInvoiceData(prev => ({
                ...prev,
                products_item2: '',
                trips_minimum_hours2: '0',
                trips_minimum_charges2: '0',
            }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await saveInvoiceData(invoiceData);
            if (response.startsWith('SUCCESS')) {
                addToast('Invoice saved successfully!', 'success');
                onSaveSuccess();
            } else {
                throw new Error(response);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addToast(`Failed to save invoice: ${errorMessage}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }
    
    const serviceOptions = services.map((service) => ({
        value: service[3],
        label: `${service[0]} (${service[1]}) - ${service[2]}`
    }));


    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-300">
                {/* Header */}
                <div className="flex justify-between items-center border border-gray-400 p-2">
                    <div className="flex items-center">
                        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFY6OA_-B3xK_AfiNz8lGz87LIZIg9LxoslTBZtsl22lvtsG-zdRDyveJXTWCdNC9T3tKsmpjVOnN1zpEJhE97MD0J3zEN2MQ5ozlwXZkfbGOQAiZfEaw_KbWMF74rCDZD5E2wsqrkuZpwXIsELOMuqizXvIFs65ViFGdGqFuE9QpURT4jve_hr8K714M/s794/sbt%20logo.jpg" alt="SBT Transport Logo" className="h-24 w-auto mr-4"/>
                        <div>
                            <h1 className="text-xl font-bold text-blue-700">SRI BALAJI TRANSPORT</h1>
                            <p className="text-xs font-bold">NO:3/96, Kumaran Kudil Annex 3rd Street, Thuraipakkam, Chennai-97</p>
                            <p className="text-xs font-bold">Phone: 87789-92624, 97907-24160 | Email: sbttransport.75@gmail.com</p>
                        </div>
                    </div>
                    <div className="w-1/4 space-y-1">
                        <div className="flex items-center">
                            <label className="text-xs font-bold w-28">Memo No:</label>
                            <InvoiceInput name="trips_memo_no" value={invoiceData.trips_memo_no} readOnly />
                        </div>
                        <div className="flex items-center">
                            <label className="text-xs font-bold w-28">Date:</label>
                            <InvoiceInput name="trip_operated_date1" type="date" value={invoiceData.trip_operated_date1} onChange={handleChange} />
                        </div>
                         <div className="flex items-center">
                            <label className="text-xs font-bold w-28">Vehicle No:</label>
                            <InvoiceInput name="trips_vehicle_no" value={invoiceData.trips_vehicle_no} onChange={handleChange} />
                        </div>
                        <div className="flex items-center">
                            <label className="text-xs font-bold w-28">Vehicle Type:</label>
                            <InvoiceInput name="trips_vehicle_type" value={invoiceData.trips_vehicle_type} readOnly />
                        </div>
                    </div>
                </div>

                {/* Customer, Time, KM */}
                <div className="grid grid-cols-12 gap-px border border-gray-400 border-t-0">
                    <div className="col-span-6 border-r border-gray-400 p-2 space-y-1">
                         <div className="flex items-center">
                            <label className="text-xs font-bold w-32">Customer Name:</label>
                             <ComboBox
                                value={invoiceData.customers_name}
                                onChange={handleCustomerNameChange}
                                options={customerNames.map(name => ({ value: name, label: name }))}
                                placeholder="Type or select a customer..."
                            />
                        </div>
                         <div className="flex items-center">
                            <label className="text-xs font-bold w-32">Address 1:</label>
                            <InvoiceInput name="customers_address1" value={invoiceData.customers_address1} onChange={handleChange} readOnly />
                        </div>
                         <div className="flex items-center">
                            <label className="text-xs font-bold w-32">Address 2:</label>
                            <InvoiceInput name="customers_address2" value={invoiceData.customers_address2} onChange={handleChange} readOnly />
                        </div>
                    </div>
                    <div className="col-span-3 border-r border-gray-400 p-2 space-y-1">
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Start Time 1:</label><InvoiceInput type="time" name="trips_starting_time1" value={invoiceData.trips_starting_time1} onChange={handleChange}/></div>
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Closing Time 1:</label><InvoiceInput type="time" name="trips_closing_time1" value={invoiceData.trips_closing_time1} onChange={handleChange}/></div>
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Start Time 2:</label><InvoiceInput type="time" name="trips_starting_time2" value={invoiceData.trips_starting_time2} onChange={handleChange}/></div>
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Closing Time 2:</label><InvoiceInput type="time" name="trips_closing_time2" value={invoiceData.trips_closing_time2} onChange={handleChange}/></div>
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Total Hours:</label><InvoiceInput name="trips_total_hours" value={invoiceData.trips_total_hours} readOnly/></div>
                    </div>
                    <div className="col-span-3 p-2 space-y-1">
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Start KM 1:</label><InvoiceInput type="number" name="trips_startingKm1" value={invoiceData.trips_startingKm1} onChange={handleChange}/></div>
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Closing KM 1:</label><InvoiceInput type="number" name="trips_closingKm1" value={invoiceData.trips_closingKm1} onChange={handleChange}/></div>
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Start KM 2:</label><InvoiceInput type="number" name="trips_startingKm2" value={invoiceData.trips_startingKm2} onChange={handleChange}/></div>
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Closing KM 2:</label><InvoiceInput type="number" name="trips_closingKm2" value={invoiceData.trips_closingKm2} onChange={handleChange}/></div>
                        <div className="flex items-center"><label className="text-xs font-bold w-24">Total KM:</label><InvoiceInput name="trips_totalKm" value={invoiceData.trips_totalKm} readOnly/></div>
                    </div>
                </div>

                {/* Particulars Table */}
                <div className="border border-gray-400 border-t-0">
                    <div className="grid grid-cols-12 bg-green-200 font-bold text-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400">Particulars</div>
                        <div className="col-span-1 p-1 border-r border-gray-400">Qty</div>
                        <div className="col-span-2 p-1 border-r border-gray-400">Rate</div>
                        <div className="col-span-3 p-1">Amount</div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400">
                             <ComboBox
                                value={invoiceData.products_item}
                                onChange={handleServiceChange}
                                options={serviceOptions}
                                placeholder="Type or select a service..."
                            />
                        </div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput name="trips_minimum_hours1" value={invoiceData.trips_minimum_hours1} readOnly/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_minimum_charges1" type="number" value={invoiceData.trips_minimum_charges1} onChange={handleChange}/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400">
                           <ComboBox
                                value={invoiceData.products_item2}
                                onChange={handleServiceChange2}
                                options={serviceOptions}
                                placeholder="Type or select a service..."
                            />
                        </div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput name="trips_minimum_hours2" value={invoiceData.trips_minimum_hours2} readOnly/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_minimum_charges2" type="number" value={invoiceData.trips_minimum_charges2} onChange={handleChange}/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput value="Extra Hours" readOnly/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput name="trips_extra_hours" value={invoiceData.trips_extra_hours} readOnly/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput name="trips_for_additional_hour_rate" type="number" value={invoiceData.trips_for_additional_hour_rate} onChange={handleChange}/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_for_additional_hour_amt" value={invoiceData.trips_for_additional_hour_amt} readOnly/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput name="trips_fixed_amt_desc" value={invoiceData.trips_fixed_amt_desc} onChange={handleChange}/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_fixed_amt" type="number" value={invoiceData.trips_fixed_amt} onChange={handleChange}/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput value="Total KM Operated" readOnly/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput name="trips_km" value={invoiceData.trips_km} readOnly/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput name="trips_km_rate" type="number" value={invoiceData.trips_km_rate} onChange={handleChange}/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_Km_amt" value={invoiceData.trips_Km_amt} readOnly/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput value="Discount (%)" readOnly/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput name="trips_discount_percentage" type="number" value={invoiceData.trips_discount_percentage} onChange={handleChange}/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_discount" value={invoiceData.trips_discount} readOnly/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput value="Driver Bata" readOnly/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput name="trips_driver_bata_qty" type="number" value={invoiceData.trips_driver_bata_qty} readOnly/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput name="trips_driver_bata_rate" type="number" value={invoiceData.trips_driver_bata_rate} onChange={handleChange}/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_driver_bata_amt" value={invoiceData.trips_driver_bata_amt} readOnly/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput value="Toll Charges" readOnly/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_toll_amt" type="number" value={invoiceData.trips_toll_amt} onChange={handleChange}/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput value="Permit" readOnly/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_permit_amt" type="number" value={invoiceData.trips_permit_amt} onChange={handleChange}/></div>
                    </div>
                     <div className="grid grid-cols-12 items-center border-b border-gray-400">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput value="Night Hault" readOnly/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_night_hault_amt" type="number" value={invoiceData.trips_night_hault_amt} onChange={handleChange}/></div>
                    </div>
                    <div className="grid grid-cols-12 items-center">
                        <div className="col-span-6 p-1 border-r border-gray-400"><InvoiceInput name="trips_other_charges_desc" value={invoiceData.trips_other_charges_desc} onChange={handleChange}/></div>
                        <div className="col-span-1 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-2 p-1 border-r border-gray-400"><InvoiceInput disabled/></div>
                        <div className="col-span-3 p-1"><InvoiceInput name="trips_other_charges_amt" type="number" value={invoiceData.trips_other_charges_amt} onChange={handleChange}/></div>
                    </div>
                </div>

                {/* Footer section */}
                <div className="grid grid-cols-12 border border-t-0 border-gray-400">
                    <div className="col-span-8 p-2 border-r border-gray-400 space-y-1">
                        <InvoiceTextarea name="trips_total_amt_in_words" value={invoiceData.trips_total_amt_in_words} readOnly rows={3} />
                        <div>
                           <label className="text-xs font-bold">Remark:</label>
                           <InvoiceTextarea name="trips_remark" value={invoiceData.trips_remark} onChange={handleChange} rows={2} />
                        </div>
                    </div>
                    <div className="col-span-2 text-right font-bold space-y-2 p-2 border-r border-gray-400">
                        <p>Total Amount:</p>
                        <p>Less Advance:</p>
                        <p>Balance:</p>
                    </div>
                    <div className="col-span-2 space-y-1 p-1">
                        <InvoiceInput name="trips_total_amt" value={invoiceData.trips_total_amt} readOnly />
                        <InvoiceInput name="trips_less_advance" type="number" value={invoiceData.trips_less_advance} onChange={handleChange} />
                        <InvoiceInput name="trips_balance" value={invoiceData.trips_balance} readOnly />
                    </div>
                </div>
                 <div className="grid grid-cols-12 border border-t-0 border-gray-400">
                    <div className="col-span-8 p-2 border-r border-gray-400">
                         <h5 className="font-bold text-sm">BANK DETAILS:</h5>
                        <p className="text-xs"><strong>Bank Name:</strong> STATE BANK OF INDIA</p>
                        <p className="text-xs"><strong>Branch:</strong> ELDAMS ROAD BRANCH ALWARPET</p>
                        <p className="text-xs"><strong>A/C No:</strong> 42804313699</p>
                        <p className="text-xs"><strong>IFSC:</strong> SBIN0002209</p>
                    </div>
                    <div className="col-span-4 p-2 text-center self-end">
                        <p className="font-bold">SRI BALAJI TRANSPORT</p>
                        <p className="text-sm mt-8 border-t border-gray-500 pt-1">Authorized Signatory</p>
                    </div>
                 </div>

            </div>
             <div className="flex justify-end space-x-4 mt-6 print-hide">
                <Button type="button" onClick={() => window.print()} className="bg-green-600 hover:bg-green-700">Print</Button>
                <Button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600">Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? <Spinner /> : 'Save Invoice'}
                </Button>
            </div>
        </form>
    );
};

export default InvoiceForm;
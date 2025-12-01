import React, { useState, useEffect, useMemo } from 'react';
import { getInvoices, deleteInvoice } from '../services/googleScriptMock';
import { InvoiceData } from '../types';
import { useToast } from '../hooks/useToast';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Input from './ui/Input';

interface InvoiceCRUDProps {
    onEditInvoice: (memoNo: string) => void;
    onDownloadInvoice: (memoNo: string) => void;
}

const InvoiceCRUD: React.FC<InvoiceCRUDProps> = ({ onEditInvoice, onDownloadInvoice }) => {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    // Delete confirmation modal state
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getInvoices();
            setInvoices(data.sort((a, b) => b.trips_memo_no.localeCompare(a.trips_memo_no)));
        } catch (error) {
            addToast('Failed to fetch invoices.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm) {
            return invoices;
        }
        return invoices.filter(invoice =>
            invoice.trips_memo_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.customers_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [invoices, searchTerm]);

    const openDeleteConfirmation = (invoice: InvoiceData) => {
        setInvoiceToDelete(invoice);
        setIsDeleteConfirmOpen(true);
    };

    const closeDeleteConfirmation = () => {
        setInvoiceToDelete(null);
        setIsDeleteConfirmOpen(false);
    };

    const handleDelete = async () => {
        if (invoiceToDelete) {
            setIsSubmitting(true);
            try {
                await deleteInvoice(invoiceToDelete.trips_memo_no);
                addToast('Invoice deleted successfully', 'success');
                await fetchData();
            } catch (error) {
                addToast('Failed to delete invoice', 'error');
            } finally {
                setIsSubmitting(false);
                closeDeleteConfirmation();
            }
        }
    };

    const headers = ["Memo No", "Date", "Customer Name", "Vehicle No", "Total Amount", "Actions"];

    return (
        <Card title="Manage Invoices">
            <div className="flex justify-between items-center mb-4">
                <Input
                    id="search"
                    label=""
                    placeholder="Search by Memo No or Customer..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner />
                </div>
            ) : (
                <div className="overflow-x-auto max-h-[70vh]">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-200 sticky top-0">
                            <tr>
                                {headers.map((header) => (
                                    <th key={header} className="px-4 py-2 text-left font-semibold text-gray-700">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((invoice) => (
                                <tr key={invoice.trips_memo_no} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium">{invoice.trips_memo_no}</td>
                                    <td className="px-4 py-2">{invoice.trip_operated_date1}</td>
                                    <td className="px-4 py-2">{invoice.customers_name}</td>
                                    <td className="px-4 py-2">{invoice.trips_vehicle_no}</td>
                                    <td className="px-4 py-2 text-right">{parseFloat(invoice.trips_balance).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex space-x-4">
                                            <button onClick={() => onEditInvoice(invoice.trips_memo_no)} className="text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => onDownloadInvoice(invoice.trips_memo_no)} className="flex items-center text-green-600 hover:underline">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download PDF
                                            </button>
                                            <button onClick={() => openDeleteConfirmation(invoice)} className="text-red-600 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
             {isDeleteConfirmOpen && invoiceToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p>Are you sure you want to delete invoice <strong>{invoiceToDelete.trips_memo_no}</strong> for <strong>{invoiceToDelete.customers_name}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end mt-6 space-x-3">
                            <Button onClick={closeDeleteConfirmation} className="bg-gray-300 text-gray-800 hover:bg-gray-400">Cancel</Button>
                            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                                {isSubmitting ? <Spinner/> : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default InvoiceCRUD;
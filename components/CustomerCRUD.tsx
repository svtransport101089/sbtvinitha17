import React, { useState, useEffect, useMemo } from 'react';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '../services/googleScriptMock';
import { Customer } from '../types';
import { useToast } from '../hooks/useToast';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Input from './ui/Input';

const CustomerCRUD: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<Customer>>({});
    const [recordToDelete, setRecordToDelete] = useState<Customer | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getCustomers();
            setCustomers(data);
        } catch (error) {
            addToast('Failed to fetch customers.', 'error');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm) {
            return customers;
        }
        return customers.filter(customer =>
            Object.values(customer).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [customers, searchTerm]);

    const handleOpenModal = (customer: Customer | null) => {
        if (customer) {
            setCurrentRecord({ ...customer });
        } else {
            setCurrentRecord({ customers_name: '', customers_address1: '', customers_address2: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRecord({});
    };
    
    const handleSave = async () => {
        if (isSubmitting) return;
        if (!currentRecord.customers_name?.trim() || !currentRecord.customers_address1?.trim() || !currentRecord.customers_address2?.trim()) {
            addToast("All fields are required and cannot be empty.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            if (currentRecord.id) {
                await updateCustomer(currentRecord as Customer);
                addToast('Customer updated successfully', 'success');
            } else {
                await addCustomer(currentRecord as Omit<Customer, 'id'>);
                addToast('Customer added successfully', 'success');
            }
            await fetchData();
        } catch (error) {
            addToast('Failed to save customer', 'error');
            console.error(error);
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };
    
    const openDeleteConfirmation = (customer: Customer) => {
        setRecordToDelete(customer);
        setIsDeleteConfirmOpen(true);
    };

    const closeDeleteConfirmation = () => {
        setIsDeleteConfirmOpen(false);
        setRecordToDelete(null);
    };

    const handleDelete = async () => {
        if (recordToDelete?.id) {
            if(isSubmitting) return;
            setIsSubmitting(true);
            try {
                await deleteCustomer(recordToDelete.id);
                addToast('Customer deleted successfully', 'success');
                await fetchData();
            } catch (error) {
                addToast('Failed to delete customer', 'error');
                console.error(error);
            } finally {
                setIsSubmitting(false);
                closeDeleteConfirmation();
            }
        }
    };
    
    const handleModalInputChange = (field: keyof Customer, value: string) => {
        setCurrentRecord(prev => ({ ...prev, [field]: value }));
    };

    const headers = ["Customer Name", "Address 1", "Address 2", "Actions"];

    return (
        <Card title="Manage Customers">
            <div className="flex justify-between items-center mb-4">
                <Input
                    id="searchCustomers"
                    label=""
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
                <Button onClick={() => handleOpenModal(null)}>Add New Customer</Button>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner /></div>
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
                            {filteredData.map((customer) => (
                                <tr key={customer.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{customer.customers_name}</td>
                                    <td className="px-4 py-2">{customer.customers_address1}</td>
                                    <td className="px-4 py-2">{customer.customers_address2}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleOpenModal(customer)} className="text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => openDeleteConfirmation(customer)} className="text-red-600 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">{currentRecord.id ? 'Edit Customer' : 'Add New Customer'}</h3>
                        <div className="space-y-4">
                            <Input
                                id="customerName"
                                label="Customer Name"
                                value={currentRecord.customers_name || ''}
                                onChange={(e) => handleModalInputChange('customers_name', e.target.value)}
                            />
                            <Input
                                id="address1"
                                label="Address Line 1"
                                value={currentRecord.customers_address1 || ''}
                                onChange={(e) => handleModalInputChange('customers_address1', e.target.value)}
                            />
                             <Input
                                id="address2"
                                label="Address Line 2"
                                value={currentRecord.customers_address2 || ''}
                                onChange={(e) => handleModalInputChange('customers_address2', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <Button onClick={handleCloseModal} className="bg-gray-300 text-gray-800 hover:bg-gray-400">Cancel</Button>
                            <Button onClick={handleSave} disabled={isSubmitting}>
                                {isSubmitting ? <Spinner /> : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteConfirmOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
                        <div className="flex justify-end mt-6 space-x-3">
                            <Button onClick={closeDeleteConfirmation} className="bg-gray-300 text-gray-800 hover:bg-gray-400">Cancel</Button>
                            <Button onClick={handleDelete} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                                {isSubmitting ? <Spinner /> : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CustomerCRUD;
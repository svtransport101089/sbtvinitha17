import React, { useState, useEffect, useMemo } from 'react';
import { getLookupData, addLookupRecord, updateLookupRecord, deleteLookupRecord } from '../services/googleScriptMock';
import { useToast } from '../hooks/useToast';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Input from './ui/Input';
import { Lookup } from '../types';

const LookupCRUD: React.FC = () => {
    const [lookupData, setLookupData] = useState<Lookup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<Lookup>>({});
    const [recordToDelete, setRecordToDelete] = useState<Lookup | null>(null);

    const headers: (keyof Lookup)[] = ["driver_name", "license_number", "phone"];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getLookupData();
            setLookupData(data);
        } catch (error) {
            addToast('Failed to fetch lookup data.', 'error');
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
            return lookupData;
        }
        return lookupData.filter(row =>
            Object.values(row).some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [lookupData, searchTerm]);

    const handleOpenModal = (record: Lookup | null) => {
        if (record) {
            setCurrentRecord({ ...record });
        } else {
            setCurrentRecord({ driver_name: '', license_number: '', phone: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRecord({});
    };
    
    const handleSave = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            if (currentRecord.id) {
                await updateLookupRecord(currentRecord as Lookup);
                addToast('Lookup record updated successfully', 'success');
            } else {
                await addLookupRecord(currentRecord as Omit<Lookup, 'id'>);
                addToast('Lookup record added successfully', 'success');
            }
            fetchData(); // Refresh data
        } catch (error) {
            addToast('Failed to save lookup record', 'error');
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };
    
    const openDeleteConfirmation = (record: Lookup) => {
        setRecordToDelete(record);
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
                await deleteLookupRecord(recordToDelete.id);
                addToast('Lookup record deleted successfully', 'success');
                fetchData();
            } catch (error) {
                addToast('Failed to delete lookup record', 'error');
            } finally {
                setIsSubmitting(false);
                closeDeleteConfirmation();
            }
        }
    };
    
    const handleModalInputChange = (field: keyof Lookup, value: string) => {
        setCurrentRecord(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card title="Manage Lookup Table">
            <div className="flex justify-between items-center mb-4">
                <Input
                    id="search"
                    label=""
                    placeholder="Search lookup data..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
                <Button onClick={() => handleOpenModal(null)}>Add New Record</Button>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                {headers.map((header) => (
                                    <th key={header} className="px-4 py-2 text-left font-semibold text-gray-700 capitalize">{header.replace(/_/g, ' ')}</th>
                                ))}
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row) => (
                                <tr key={row.id} className="border-b hover:bg-gray-50">
                                    {headers.map((header) => (
                                        <td key={header} className="px-4 py-2">{row[header]}</td>
                                    ))}
                                    <td className="px-4 py-2">
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleOpenModal(row)} className="text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => openDeleteConfirmation(row)} className="text-red-600 hover:underline">Delete</button>
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
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">{currentRecord.id ? 'Edit Record' : 'Add New Record'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {headers.map((header) => (
                                <Input
                                    key={header}
                                    id={header}
                                    label={header.replace(/_/g, ' ')}
                                    value={currentRecord[header] || ''}
                                    onChange={(e) => handleModalInputChange(header, e.target.value)}
                                />
                            ))}
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <Button onClick={handleCloseModal} className="bg-gray-300 text-gray-800 hover:bg-gray-400">Cancel</Button>
                            <Button onClick={handleSave} disabled={isSubmitting}>
                                {isSubmitting ? <Spinner/> : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
             {isDeleteConfirmOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
                        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
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

export default LookupCRUD;
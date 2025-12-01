import React, { useState, useEffect, useMemo } from 'react';
import { getCalculations, addCalculationRecord, updateCalculationRecord, deleteCalculationRecord } from '../services/googleScriptMock';
import { useToast } from '../hooks/useToast';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Input from './ui/Input';
import { Calculation } from '../types';

// FIX: Define a type for string keys of Calculation to ensure type safety.
type CalculationStringKeys = keyof Omit<Calculation, 'id'>;

const CalculationsCRUD: React.FC = () => {
    const [calculationsData, setCalculationsData] = useState<Calculation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<Calculation>>({});
    const [recordToDelete, setRecordToDelete] = useState<Calculation | null>(null);

    const headers: CalculationStringKeys[] = [
        "products_type_category", "products_minimum_hours", "products_minimum_km", 
        "products_minimum_charges", "products_additional_hours_charges", 
        "products_running_hours", "products_driver_bata"
    ];
    
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getCalculations();
            setCalculationsData(data);
        } catch (error) {
            addToast('Failed to fetch calculation data.', 'error');
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
            return calculationsData;
        }
        return calculationsData.filter(row =>
            Object.values(row).some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [calculationsData, searchTerm]);

    const handleOpenModal = (record: Calculation | null) => {
        if (record) {
            setCurrentRecord({ ...record });
        } else {
            const newRecord: Partial<Calculation> = {};
            // FIX: Strongly typing `headers` removes the need for casting and resolves the 'never' type error.
            headers.forEach(h => newRecord[h] = '');
            setCurrentRecord(newRecord);
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
                await updateCalculationRecord(currentRecord as Calculation);
                addToast('Record updated successfully', 'success');
            } else {
                await addCalculationRecord(currentRecord as Omit<Calculation, 'id'>);
                addToast('Record added successfully', 'success');
            }
            await fetchData();
        } catch (error) {
            addToast('Failed to save record', 'error');
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };
    
    const openDeleteConfirmation = (record: Calculation) => {
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
                await deleteCalculationRecord(recordToDelete.id);
                addToast('Record deleted successfully', 'success');
                await fetchData();
            } catch (error) {
                addToast('Failed to delete record', 'error');
            } finally {
                setIsSubmitting(false);
                closeDeleteConfirmation();
            }
        }
    };
    
    const handleModalInputChange = (field: keyof Calculation, value: string) => {
        setCurrentRecord(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card title="Manage Calculation Table">
            <div className="flex justify-between items-center mb-4">
                <Input
                    id="search"
                    label=""
                    placeholder="Search calculation data..."
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
                                    <th key={header} className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">{header.replace(/_/g, ' ')}</th>
                                ))}
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row) => (
                                <tr key={row.id} className="border-b hover:bg-gray-50">
                                    {headers.map(header => (
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
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-4">{currentRecord.id ? 'Edit Record' : 'Add New Record'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {headers.map((header) => (
                                <Input
                                    key={header}
                                    id={header}
                                    label={header.replace(/_/g, ' ')}
                                    value={String(currentRecord[header] || '')}
                                    onChange={(e) => handleModalInputChange(header, e.target.value)}
                                />
                            ))}
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
                        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
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

export default CalculationsCRUD;
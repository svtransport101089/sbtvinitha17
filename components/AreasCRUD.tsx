import React, { useState, useEffect, useMemo } from 'react';
import { getAreas, addArea, updateArea, deleteArea } from '../services/googleScriptMock';
import { useToast } from '../hooks/useToast';
import Card from './ui/Card';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import Input from './ui/Input';
import { LOCATION_CATEGORIES } from '../constants';
import Select from './ui/Select';
import { Area } from '../types';

const AreasCRUD: React.FC = () => {
    const [areas, setAreas] = useState<Area[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Partial<Area>>({});
    const [recordToDelete, setRecordToDelete] = useState<Area | null>(null);

    const headers = ["Location Area", "Location Category"];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getAreas();
            setAreas(data);
        } catch (error) {
            addToast('Failed to fetch areas.', 'error');
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
            return areas;
        }
        return areas.filter(row =>
            Object.values(row).some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [areas, searchTerm]);

    const handleOpenModal = (area: Area | null) => {
        if (area) {
            setCurrentRecord({ ...area });
        } else {
            setCurrentRecord({ locationArea: '', locationCategory: LOCATION_CATEGORIES[0] });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentRecord({});
    };
    
    const handleSave = async () => {
        if (isSubmitting) return;
        if (!currentRecord.locationArea?.trim() || !currentRecord.locationCategory?.trim()) {
            addToast("All fields must be filled.", "error");
            return;
        }
        setIsSubmitting(true);
        try {
            if (currentRecord.id) {
                await updateArea(currentRecord as Area);
                addToast('Area updated successfully', 'success');
            } else {
                await addArea(currentRecord as Omit<Area, 'id'>);
                addToast('Area added successfully', 'success');
            }
            await fetchData();
        } catch (error) {
            addToast('Failed to save area', 'error');
            console.error(error);
        } finally {
            setIsSubmitting(false);
            handleCloseModal();
        }
    };
    
    const openDeleteConfirmation = (area: Area) => {
        setRecordToDelete(area);
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
                await deleteArea(recordToDelete.id);
                addToast('Area deleted successfully', 'success');
                await fetchData();
            } catch (error) {
                addToast('Failed to delete area', 'error');
                console.error(error);
            } finally {
                setIsSubmitting(false);
                closeDeleteConfirmation();
            }
        }
    };
    
    const handleModalInputChange = (field: keyof Area, value: string) => {
        setCurrentRecord(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card title="Manage Areas">
            <div className="flex justify-between items-center mb-4">
                <Input
                    id="searchAreas"
                    label=""
                    placeholder="Search areas..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
                <Button onClick={() => handleOpenModal(null)}>Add New Area</Button>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner /></div>
            ) : (
                <div className="overflow-x-auto max-h-[60vh]">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-200 sticky top-0">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="px-4 py-2 text-left font-semibold text-gray-700">{header}</th>
                                ))}
                                <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row) => (
                                <tr key={row.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{row.locationArea}</td>
                                    <td className="px-4 py-2">{row.locationCategory}</td>
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
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">{currentRecord.id ? 'Edit Area' : 'Add New Area'}</h3>
                        <div className="space-y-4">
                            <Input
                                id="locationArea"
                                label="Location Area"
                                value={currentRecord.locationArea || ''}
                                onChange={(e) => handleModalInputChange('locationArea', e.target.value)}
                            />
                            <Select
                                id="locationCategory"
                                label="Location Category"
                                value={currentRecord.locationCategory || ''}
                                onChange={(e) => handleModalInputChange('locationCategory', e.target.value)}
                                options={LOCATION_CATEGORIES.map(c => ({ value: c, label: c }))}
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
                        <p>Are you sure you want to delete this area? This action cannot be undone.</p>
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

export default AreasCRUD;
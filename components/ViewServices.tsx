import React, { useState, useEffect, useMemo } from 'react';
import { getViewAllServicesData } from '../services/googleScriptMock';
import { useToast } from '../hooks/useToast';
import Card from './ui/Card';
import Spinner from './ui/Spinner';
import Input from './ui/Input';

const ViewServices: React.FC = () => {
    const [services, setServices] = useState<string[][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    const headers = [
        "Location Area", "Location Category", "Vehicle Type", "Product Item",
        "Min Hours", "Min KM", "Min Charges", "Add. Hour Charge", "Running Hours", "Driver Bata"
    ];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const data = await getViewAllServicesData();
            setServices(data);
        } catch (error) {
            addToast('Failed to fetch services data.', 'error');
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
        if (!searchTerm) return services;
        return services.filter(row =>
            row.some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [services, searchTerm]);

    return (
        <Card title="View All Services">
            <div className="flex justify-between items-center mb-4">
                <Input
                    id="searchServices"
                    label=""
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-1/3"
                />
                 <p className="text-sm text-gray-500">Data is generated from Areas and Calculations.</p>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><Spinner /></div>
            ) : (
                <div className="overflow-x-auto max-h-[70vh]">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-gray-200 sticky top-0">
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index} className="px-4 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-b hover:bg-gray-50">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-2 whitespace-nowrap">{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default ViewServices;
import React from 'react';
import Card from './ui/Card';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-700 mb-6">Welcome to SBT Transport Admin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Quick Stats">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Trips Today</span>
              <span className="font-bold text-xl text-blue-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vehicles on Road</span>
              <span className="font-bold text-xl text-green-600">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Payments</span>
              <span className="font-bold text-xl text-red-600">₹ 45,000</span>
            </div>
          </div>
        </Card>
        <Card title="System Overview">
          <p className="text-gray-600">
            Use the sidebar navigation to manage different aspects of the transport system.
            You can create new trips, update existing ones, and manage customer and location data.
          </p>
        </Card>
        <Card title="Quick Actions">
          <div className="flex flex-col space-y-2">
            <p className="text-gray-500">Note: Data is currently mocked for demonstration.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
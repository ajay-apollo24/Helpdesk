import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Welcome Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">Here's an overview of your helpdesk activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Open Tickets</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">12</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Resolved Today</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">5</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Response Time</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">15m</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <span className="text-sm font-medium leading-none text-blue-800">JD</span>
              </span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-sm text-gray-500">Created a new ticket</p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                <span className="text-sm font-medium leading-none text-green-800">SJ</span>
              </span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-sm text-gray-500">Updated ticket status</p>
            </div>
            <div className="ml-auto">
              <p className="text-sm text-gray-500">4 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
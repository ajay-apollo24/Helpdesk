import React from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Layout from '../components/Layout.tsx';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name || 'Agent'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Your Role</h3>
              <p className="mt-1 text-gray-500">{user?.role || 'Loading...'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Department</h3>
              <p className="mt-1 text-gray-500">{user?.department?.name || 'Not assigned'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Status</h3>
              <p className="mt-1 text-gray-500">{user?.status || 'Loading...'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tickets */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tickets</h3>
            <div className="space-y-4">
              {/* Dummy ticket data */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Printer not working</p>
                    <p className="text-sm text-gray-500">Customer: John Doe</p>
                  </div>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    In Progress
                  </span>
                </div>
              </div>
              <div className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Email access issues</p>
                    <p className="text-sm text-gray-500">Customer: Jane Smith</p>
                  </div>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Resolved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tickets Resolved</span>
                <span className="font-medium text-gray-900">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Average Response Time</span>
                <span className="font-medium text-gray-900">15 minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Customer Satisfaction</span>
                <span className="font-medium text-gray-900">4.5/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 
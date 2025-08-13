import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600">
        Welcome to the admin dashboard. Here you can manage users, portfolios, and system settings.
      </p>
      
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-indigo-900">User Management</h3>
          <p className="text-indigo-700 text-sm mt-1">Manage user accounts and permissions</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-900">Portfolio Analytics</h3>
          <p className="text-green-700 text-sm mt-1">View portfolio performance metrics</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-900">System Settings</h3>
          <p className="text-yellow-700 text-sm mt-1">Configure system preferences</p>
        </div>
      </div>
    </div>
  );
}
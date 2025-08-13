import React from 'react';

export default function ClientDashboardPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Dashboard</h1>
      <p className="text-gray-600">
        Welcome to your client dashboard. Here you can manage your portfolio and projects.
      </p>
      
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900">My Portfolio</h3>
          <p className="text-blue-700 text-sm mt-1">View and edit your portfolio</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-purple-900">Projects</h3>
          <p className="text-purple-700 text-sm mt-1">Manage your projects</p>
        </div>
        
        <div className="bg-teal-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-teal-900">Analytics</h3>
          <p className="text-teal-700 text-sm mt-1">View your portfolio analytics</p>
        </div>
      </div>
    </div>
  );
}
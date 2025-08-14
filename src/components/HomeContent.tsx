'use client';

import { useAuth } from '../app/contexts/AuthContext';
import Link from 'next/link';

export const HomeContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // if (user) {
  //   return (
  //     <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
  //       <div className="text-center">
  //         <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
  //           Welcome back, {user.name}!
  //         </h2>
  //         <p className="mt-4 text-lg text-gray-600">
  //           You are logged in as a {user.role}.
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Welcome to Portfolio Hub {user?.name}
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          A comprehensive platform for managing your portfolio and projects.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/auth/login" className="bg-indigo-600 text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-indigo-700">
            Get Started
          </Link>
          <Link href="/auth/signup" className="bg-white text-indigo-600 px-6 py-3 rounded-md text-sm font-medium border border-indigo-600 hover:bg-indigo-50">
            Learn More
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Portfolio Management</h3>
            <p className="mt-2 text-sm text-gray-600">
              Create and manage your professional portfolio with ease.
            </p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Project Tracking</h3>
            <p className="mt-2 text-sm text-gray-600">
              Track your projects and showcase your work effectively.
            </p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
            <p className="mt-2 text-sm text-gray-600">
              Get insights into your portfolio performance and engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

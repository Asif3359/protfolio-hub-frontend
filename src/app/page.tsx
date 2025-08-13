import React from 'react';
import { HomeContent } from './components/HomeContent';
import NavBarComponent from './components/NavBarComponent';

function HomePage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Portfolio Hub</h1>
            </div>
            <NavBarComponent />
          </div>
        </div>
      </nav>
      
      <HomeContent />
    </div>
  );
}

export default HomePage;
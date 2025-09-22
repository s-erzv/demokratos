import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="block md:flex min-h-screen bg-gray-100 relative">
      
       <Sidebar />
       
      <main className="w-full md:flex-1 h-screen overflow-y-auto py-4 px-2 md:px-8"> 
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="block md:flex min-h-screen bg-gray-100 relative">
      
       <Sidebar />
       
      <main className="w-full md:flex-1 h-screen overflow-y-auto pt-8 pb-8 px-4 md:px-8"> 
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
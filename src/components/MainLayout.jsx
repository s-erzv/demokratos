import React from 'react';
import Sidebar from './Sidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="block md:flex min-h-screen bg-gray-100 relative">
      
       <Sidebar />
       
      <main className="scrollbar-hide w-full md:flex-1 h-screen overflow-y-auto py-4 px-4 md:px-4"> 
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
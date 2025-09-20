import React, { useState } from 'react';
import { Home, Mic, FileText, Users, Menu, X, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoDemokratos from '/demokratos.svg';
import { useAuth } from '../hooks/AuthContext'; 

const menuItems = [
  { name: 'Home', icon: Home, link: '/' },
  { name: 'Vote Kebijakan', icon: Mic, link: '/vote' },
  { name: 'Laporan', icon: FileText, link: '/laporan' },
  { name: 'Diskusi', icon: Users, link: '/diskusi' },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { userData } = useAuth();

  return (
    <>
      <div className="md:hidden p-4">
        <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation">
          {isOpen ? <X size={24} className="text-gray-800" /> : <Menu size={24} className="text-gray-800" />}
        </button>
      </div>

      <aside 
        className={`bg-white text-gray-800 min-h-screen transition-all duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 fixed md:relative z-20 
            w-16 hover:w-56 flex flex-col py-4 border-r border-gray-200 group`}
        >

        <div className="flex items-center justify-center md:justify-start h-16 w-full mb-8 px-4">
          <img src={logoDemokratos} alt="Demokratos Logo" className="w-10 h-10 transition-transform duration-300 ease-in-out" />
          <span className="hidden md:group-hover:block text-xl font-semibold ml-3 text-primary transition-opacity duration-300 opacity-0 group-hover:opacity-100">Demokratos</span>
        </div>

        <nav className="flex-1 w-full">
          <ul className="flex flex-col items-center">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.link;

              return (
                <li key={index} className="relative w-full">
                  <Link 
                    to={item.link}
                    className={`flex h-10 items-center gap-3 rounded-lg px-4 py-2 transition-all duration-150 ease-in-out
                        ${isActive ? 'bg-gray-100' : 'text-primary hover:bg-gray-100'}
                    `}
                    >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <IconComponent size={22} className="text-primary group-hover:text-primary" />
                    </div>
                    <span 
                        className={`hidden md:group-hover:block ml-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100 
                        ${isActive ? 'text-primary' : ''}`}
                    >
                        {item.name}
                    </span>
                    </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative w-full mt-auto">
          <Link 
            to="/profile"
            className={`flex h-10 items-center gap-3 rounded-lg px-3 py-2 transition-all duration-150 ease-in-out group-hover:md:px-4
                ${location.pathname === '/profile' ? 'bg-gray-100 text-primary' : 'text-primary hover:bg-gray-100'}`}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              <UserCircle size={22} className="text-primary group-hover:text-primary" />
            </div>
            <span className="hidden md:group-hover:block ml-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                {userData?.fullName || 'Profile'}
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
import React, { useState, useEffect, useRef } from 'react';
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

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { userData } = useAuth();
  const sidebarRef = useRef(null);

  useClickOutside(sidebarRef, () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          className="bg-white p-2 rounded-full shadow-md"
        >
          {isOpen ? <X size={24} className="text-gray-800" /> : <Menu size={24} className="text-gray-800" />}
        </button>
      </div>

      <aside
        ref={sidebarRef}
        className={`bg-white text-gray-800 h-screen transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
          fixed md:relative md:translate-x-0 md:w-20 md:hover:w-64 z-40 
          flex flex-col border-r border-gray-200 group`}
      >
        <div className="pt-20 md:pt-4 px-4">
          <Link to="/" className="flex items-center h-16 w-full mb-8">
            <img src={logoDemokratos} alt="Demokratos Logo" className="w-10 h-10 flex-shrink-0" />
            <span className={`text-2xl font-bold ml-3 text-primary whitespace-nowrap transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${isOpen ? 'opacity-100' : 'md:opacity-0'}`}>
              Demokratos
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <ul className="flex flex-col items-start px-4 space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.link;
              return (
                <li key={item.name} className="w-full">
                  <Link
                    to={item.link}
                    className={`flex items-center h-12 gap-4 rounded-lg px-4 transition-colors duration-200
                      ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <IconComponent size={22} className="flex-shrink-0" />
                    <span className={`whitespace-nowrap transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${isOpen ? 'opacity-100' : 'md:opacity-0'}`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            to="/profile"
            className={`flex items-center h-12 gap-4 rounded-lg px-4 transition-colors duration-200
              ${location.pathname === '/profile' ? 'bg-gray-100' : 'hover:bg-gray-100'}`
            }
          >
            <div className="flex-shrink-0">
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt="Profil" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <UserCircle size={24} className="text-gray-600" />
              )}
            </div>
            <div className={`flex-1 min-w-0 transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${isOpen ? 'opacity-100' : 'md:opacity-0'}`}>
              <p className="font-semibold text-sm truncate text-gray-800">{userData?.fullName || 'Profile'}</p>
              <p className="text-xs text-gray-500 truncate">{userData?.role || 'Guest'}</p>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
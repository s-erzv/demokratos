import React, { useState, useEffect } from 'react';
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
  // Atur default state: true jika lebar layar < md (mobile)
  const [isOpen, setIsOpen] = useState(window.innerWidth < 768); 
  const location = useLocation();
  const { userData } = useAuth();

  // Efek untuk menutup sidebar saat navigasi (di mobile)
  useEffect(() => {
    // Cek jika rute berubah, dan tutup jika tampilan mobile
    if (window.innerWidth < 768) {
        setIsOpen(false);
    }
  }, [location.pathname]);


  return (
    <>
      {/* OVERLAY untuk Logic Click Outside (Hanya aktif di mobile saat menu terbuka) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30 md:hidden" 
          onClick={() => setIsOpen(false)} // Klik di overlay akan menutup menu
        />
      )}

      {/* TOMBOL TOGGLE (Hamburger) - FIXED POSITION DI MOBILE (Z-50) */}
      <div className="fixed top-0 left-0 p-4 z-50 md:hidden"> 
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          aria-label="Toggle navigation"
          className="bg-white p-2 rounded-full shadow-md"
        >
          {/* Hapus tombol X saat isOpen true, ganti dengan Menu */}
          {isOpen ? <X size={24} className="text-gray-800" /> : <Menu size={24} className="text-gray-800" />}
        </button>
      </div>

      <aside 
        className={`bg-white text-gray-800 min-h-screen transition-all duration-300 ease-in-out 
            ${isOpen ? 'translate-x-0 w-56' : '-translate-x-full w-16'} 
            md:translate-x-0 fixed md:relative z-40 
            md:w-16 md:hover:w-56 flex flex-col py-4 border-r border-gray-200 group`}
        >
        
        {/* Padding atas untuk memberi ruang tombol toggle fixed */}
        <div className="pt-16 md:pt-0"> 
          <div className={`flex items-center justify-start h-16 w-full mb-8 px-4`}>
            {/* Logo Selalu Muncul di Pojok Kiri Atas Sidebar */}
            <img src={logoDemokratos} alt="Demokratos Logo" className="w-10 h-10 transition-transform duration-300 ease-in-out" />
            
            {/* Teks Logo: Selalu terlihat saat isOpen=true, atau saat hover di desktop */}
            <span className={`text-xl font-semibold ml-3 text-primary transition-opacity duration-300 ${isOpen ? 'block opacity-100' : 'hidden md:group-hover:block opacity-0 md:group-hover:opacity-100'}`}>Demokratos</span>
          </div>
        </div>

        <nav className="flex-1 w-full">
          <ul className="flex flex-col items-start">
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
                    onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }} 
                    >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        <IconComponent size={22} className="text-primary group-hover:text-primary" />
                    </div>
                    {/* Teks Menu: Selalu terlihat saat isOpen=true */}
                    <span 
                        className={`transition-opacity duration-300 ml-3 ${isOpen ? 'block opacity-100' : 'hidden md:group-hover:block opacity-0 md:group-hover:opacity-100'} 
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
             onClick={() => { if (window.innerWidth < 768) setIsOpen(false); }}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center">
              <UserCircle size={22} className="text-primary group-hover:text-primary" />
            </div>
            {/* Teks Profile: Selalu terlihat saat isOpen=true */}
            <span className={`transition-opacity duration-300 ml-3 ${isOpen ? 'block opacity-100' : 'hidden md:group-hover:block opacity-0 md:group-hover:opacity-100'}`}>
                {userData?.fullName || 'Profile'}
            </span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
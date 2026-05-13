import React from 'react';
import { Menu, Mail, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserContext, removeAuthToken } from '../lib/authHelpers';

export default function Header() {
  const navigate = useNavigate();
  const user = getUserContext();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  return (
    <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 w-full shadow-sm">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-sm text-xs font-semibold">
          <Menu size={14} /> MENU
        </button>
      </div>

      <div className="flex-1 flex justify-center items-center gap-4">
        <h1 className="text-[#1A935A] font-bold text-sm hidden lg:block tracking-wide uppercase">MAKERERE UNIVERSITY</h1>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.student_number || 'STU'}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col text-[11px] text-gray-700">
            <span>Hi, <span className="font-semibold">{user?.name || user?.student_number}</span></span>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700 border-l border-gray-200 pl-4 relative group">
          <Mail size={16} />
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-500 hover:text-red-700 border-l border-gray-200 pl-4 text-xs font-bold"
          title="Logout"
        >
          <LogOut size={16} /> <span className="hidden sm:inline">LOGOUT</span>
        </button>
      </div>
    </header>
  );
}

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Hash, Edit, DollarSign, GraduationCap, Briefcase, CheckCircle, User, Mail, Calendar, ClipboardList, Clock } from 'lucide-react';
import { getUserContext } from '../lib/authHelpers';

export default function Sidebar() {
  const user = getUserContext();
  const location = useLocation();

  const menuItems = [
    { name: 'ENROLLMENT & REGISTRATION...', icon: Edit, hasArrow: true, path: '/dashboard' },
    { name: 'TIMETABLE & CALENDAR', icon: Clock, hasArrow: false, path: '/timetable' },
  ];

  return (
    <div className="w-64 bg-[#2C3B4E] min-h-screen flex flex-col fixed left-0 top-0 z-30 shadow-lg hidden md:flex">
      {/* Profile Header */}
      <div className="bg-[#2B3B4C] pt-6 pb-4 flex flex-col items-center justify-center border-b border-gray-700">
        <div className="w-20 h-20 bg-gray-200 rounded-sm mb-3 flex items-center justify-center border-2 border-gray-300">
           <User size={48} className="text-gray-500" />
        </div>
        <h2 className="text-white text-[13px] font-semibold text-center">{user?.student_number || 'Student Portal'}</h2>
        <p className="text-white text-[11px] text-center font-bold mt-0.5">STUDENT NO.: {user?.student_number || 'UNKNOWN'}</p>
      </div>
      
      <nav className="flex-1 py-1 overflow-y-auto bg-white">
        <ul className="space-y-0">
          {menuItems.map((item, idx) => {
            const IconName = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/') || (item.active && item.path === '#');
            return (
              <li key={idx} className="border-b border-gray-100 last:border-0 relative">
                {isActive && (
                   <div className="absolute left-0 top-0 h-full w-1 bg-[#1A935A]"></div>
                )}
                <Link
                  to={item.path !== '#' ? item.path : '#'}
                  className={`flex items-center justify-between px-5 py-3.5 text-[11px] font-bold transition-colors ${
                    isActive 
                      ? 'text-[#1A935A] bg-gray-50/50' 
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-[10px] font-normal text-gray-500 w-3">{String(idx + 1).padStart(2, '0')}</span>
                    <IconName size={14} className={isActive ? 'text-[#1A935A]' : 'text-gray-500'} />
                    <span className="uppercase tracking-wide">{item.name}</span>
                  </div>
                  {item.hasArrow && (
                    <span className="text-[10px] transform rotate-90 opacity-60">❯</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

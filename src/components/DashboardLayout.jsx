import React from 'react';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F4F6F9] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 relative">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-20">
          {children}
        </main>
        <footer className="absolute bottom-0 w-full text-center py-4 text-xs font-semibold text-gray-500 bg-[#F4F6F9]">
          © 2026 ACMIS. All rights Reserved.
        </footer>
      </div>
    </div>
  );
}

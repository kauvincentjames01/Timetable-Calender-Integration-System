import React, { useState } from 'react';
import { CheckCircle, Download, Calendar as CalendarIcon, RefreshCw, Printer, Edit } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription.js';
import { getUserContext } from '../lib/authHelpers.js';

export default function DashboardPage() {
  const { subscribe, feedUrl, loading, error } = useSubscription();
  const user = getUserContext();

  const handleSubscribe = () => {
    // Uses the authenticated student context
    const studentRegNumber = user?.student_number || '23/U/16751/PS';
    subscribe(studentRegNumber);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Status Bar */}
      <div className="bg-white border border-gray-200 rounded-sm p-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-[#1A935A]">PROGRAMME:</span>
          <span className="text-gray-700">BACHELOR OF INFORMATION SYSTEMS AND TECHNOLOGY - (BIST)</span>
          <span className="bg-[#1A935A] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm ml-2">ACTIVE</span>
        </div>
        <div className="flex items-center gap-2 text-sm border border-red-300 px-2 py-1 bg-red-50 rounded-sm">
          <span className="text-[#1A935A] text-xs font-semibold">ACADEMIC STATUS:</span>
          <span className="text-red-500 font-semibold text-xs">NORMAL PROGRESS</span>
        </div>
      </div>

      {/* Academic Info Bar */}
      <div className="bg-white border text-xs border-gray-200 rounded-sm px-3 py-2 flex items-center justify-between shadow-sm flex-wrap gap-2">
        <div className="flex items-center gap-3 font-semibold">
          <div className="flex items-center gap-1"><span className="text-gray-800">CURRENT YR.</span><span className="bg-[#1A935A] text-white px-1.5 py-0.5 rounded-sm">2025/2026</span></div>
          <div className="flex items-center gap-1"><span className="text-gray-800">CURRENT SEM.</span><span className="bg-[#1A935A] text-white px-1.5 py-0.5 rounded-sm">SEMESTER II</span></div>
          <div className="flex items-center text-[#1A935A] border border-[#1A935A] px-1.5 py-0.5 rounded-sm bg-green-50"><CheckCircle size={12} className="mr-1" /> ENROLLED</div>
          <div className="flex items-center text-[#1A935A] border border-[#1A935A] px-1.5 py-0.5 rounded-sm bg-green-50"><CheckCircle size={12} className="mr-1" /> REGISTERED</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="border border-red-200 px-2 py-0.5 rounded-sm bg-white"><span className="font-semibold">TOTAL FEES BAL DUE:</span> <span className="text-red-500 font-bold">0/=</span></div>
          <div className="bg-[#1A935A] text-white px-2 py-0.5 rounded-sm font-semibold">BALANCE ON ACCOUNT: 0/=</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
        
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 pt-3">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-[#1A935A] border-b-2 border-[#1A935A] pb-2 font-semibold text-sm">
              <Edit size={16} /> ENROLLMENT
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 pb-2 font-semibold text-sm">
              <CalendarIcon size={16} /> REGISTRATION
            </button>
          </div>
          <button className="flex items-center gap-1 text-red-500 border border-red-200 bg-red-50 px-3 py-1 rounded-sm text-xs font-semibold mb-2">
            <RefreshCw size={12} /> RELOAD
          </button>
        </div>

        <div className="p-4 space-y-4">
          
          {/* Success Alert */}
          <div className="bg-[#E8F5E9] border border-[#C8E6C9] p-3 rounded-sm flex items-center gap-2 text-[#2E7D32] text-sm font-bold">
            <CheckCircle size={16} className="text-[#1A935A]" /> ENROLLED FOR YEAR 3, SEMESTER II - 2025/2026
          </div>

          {/* Enrollment Details */}
          <div className="flex justify-between items-center mt-6">
            <h3 className="text-[#1A935A] font-bold text-[13px]">ENROLLMENT DETAILS</h3>
            <button className="flex items-center gap-2 text-[#1565C0] border border-[#BBDEFB] bg-[#E3F2FD] px-3 py-1.5 rounded-sm text-xs font-bold shadow-sm hover:bg-[#D0E9fD]">
              <Printer size={12} /> PRINT PROOF OF ENROLLMENT
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F8F9FA] rounded-sm p-4 border border-gray-200">
               <p className="text-xs text-gray-800 mb-1"><span className="font-bold">ACADEMIC YEAR:</span> 2025/2026</p>
               <p className="text-xs text-gray-800"><span className="font-bold">SEMESTER:</span> SEMESTER II <span className="font-bold ml-2">STUDY YEAR:</span> YEAR 3</p>
            </div>
            <div className="bg-[#F8F9FA] rounded-sm p-4 border border-gray-200">
               <p className="text-xs text-gray-800 mb-1"><span className="font-bold">ENROLLED AS:</span> FINALIST</p>
               <p className="text-xs text-gray-800"><span className="font-bold">ENROLLED BY:</span> SELF</p>
            </div>
            <div className="bg-[#F8F9FA] rounded-sm p-4 border border-gray-200">
               <p className="text-xs text-gray-800 mb-1"><span className="font-bold">ENROLLMENT TOKEN:</span> ENR1426266433</p>
               <p className="text-xs text-gray-800"><span className="font-bold">ENROLLED ON:</span> Tue, Mar 24th 2026, 9:34:14 pm</p>
            </div>
          </div>

          {/* Calendar Feed Section was moved to TimetablePage */}
        </div>
      </div>
    </div>
  );
}

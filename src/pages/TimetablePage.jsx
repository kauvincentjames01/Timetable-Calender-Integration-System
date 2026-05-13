import React from 'react';
import { Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription.js';
import { getUserContext } from '../lib/authHelpers.js';

export default function TimetablePage() {
  const { subscribe, feedUrl, loading, error } = useSubscription();
  const [copied, setCopied] = React.useState(false);
  const user = getUserContext();

  const handleSubscribe = () => {
    const studentRegNumber = user?.student_number || '23/U/16751/PS';
    subscribe(studentRegNumber);
  };

  const handleCopy = () => {
    if (feedUrl) {
      navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
        
        <div className="flex items-center justify-between border-b border-gray-200 px-4 pt-3">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-[#1A935A] border-b-2 border-[#1A935A] pb-2 font-semibold text-sm">
              <CalendarIcon size={16} /> ADD TO CALENDAR
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="border border-[#BBDEFB] rounded-sm overflow-hidden shadow-sm">
            <div className="bg-[#E3F2FD] text-[#0D47A1] px-4 py-2 font-bold text-[12px] flex items-center justify-between border-b border-[#BBDEFB]">
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} /> FOLLOW THE INSTRUCTIONS BELOW
              </div>
            </div>
            
            <div className="p-4 bg-white">
              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-3 font-semibold leading-relaxed">
                  How to sync your Makerere University timetable:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#1A935A] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">1</div>
                    <p className="text-[12px] text-gray-600">Click the button below to <strong>Generate</strong> your unique synchronization link.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#1A935A] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">2</div>
                    <p className="text-[12px] text-gray-600">Click <strong>Copy URL</strong> to save the link to your clipboard.</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#1A935A] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">3</div>
                    <p className="text-[12px] text-gray-600">Open your <strong>Calendar App</strong> (Google, Outlook, or Apple Calendar).</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-[#1A935A] text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold">4</div>
                    <p className="text-[12px] text-gray-600">Select <strong>"Add from URL"</strong> and paste your link to start syncing.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <button 
                  onClick={handleSubscribe} 
                  disabled={loading}
                  className="bg-[#1A935A] hover:bg-[#147a4a] text-white px-5 py-3 rounded-sm font-bold text-[11px] transition-colors shadow-sm whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'GENERATING...' : 'GENERATE CALENDAR LINK'}
                </button>
              </div>

              {error && (
               <div className="mt-3 p-2 bg-red-50 text-red-700 border border-red-200 rounded-sm text-xs font-semibold">
                  Error: {error}
                </div>
              )}

              {feedUrl && (
                <div className="mt-5 border border-[#C8E6C9] rounded-sm p-4 bg-[#F1F8E9] shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#C8E6C9] rounded-bl-full -mr-8 -mt-8"></div>
                  <CheckCircle size={16} className="absolute top-3 right-3 text-[#2E7D32]" />
                  
                  <p className="text-[#2E7D32] text-xs font-bold mb-2">FEED URL GENERATED SUCCESSFULLY</p>
                  <input 
                    readOnly 
                    value={feedUrl} 
                    className="w-full bg-white border border-[#A5D6A7] rounded-sm px-3 py-2 text-[11px] font-mono outline-none text-gray-800 mb-3 block shadow-inner" 
                    onClick={(e) => e.target.select()}
                  />
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={handleCopy}
                       className={`text-[11px] font-bold px-4 py-1.5 rounded-sm shadow-sm transition-all duration-200 flex items-center gap-2 ${
                         copied 
                           ? 'bg-[#1A935A] text-white ring-2 ring-[#C8E6C9]' 
                           : 'bg-[#1A935A] text-white hover:bg-[#147a4a] hover:scale-105 active:scale-95 cursor-pointer'
                        }`}
                     >
                        {copied ? (
                          <>
                            <CheckCircle size={14} /> COPIED!
                          </>
                        ) : (
                          'COPY URL'
                        )}
                     </button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-[#E3F2FD] border border-[#BBDEFB] rounded-sm">
                    <p className="text-xs font-bold text-[#0D47A1] mb-1">Troubleshooting Calendar Sync (Google Calendar & Outlook):</p>
                    <ul className="list-disc pl-4 text-xs text-[#0D47A1] space-y-1">
                      <li><strong>Sync Delays:</strong> Both Google Calendar and Outlook check external links intermittently. It can take up to 12-24 hours to sync for the first time or update events.</li>
                      <li><strong>Accessibility:</strong> If you are running this app in the private preview environment, external servers cannot reach the URL. The app must be fully deployed or shared publicly.</li>
                      <li><strong>How to Add in Google Calendar:</strong> Go to Settings &gt; Add calendar &gt; From URL &gt; Paste the link.</li>
                      <li><strong>How to Add in Outlook:</strong> Open Outlook &gt; Calendar &gt; Add Calendar &gt; Subscribe from web &gt; Paste the link.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

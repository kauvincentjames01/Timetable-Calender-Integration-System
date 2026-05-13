import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken, getUserContext, getAuthToken } from '../lib/authHelpers';
import { LogOut, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const user = getUserContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '', course_name: '', lecturer: '', location: '', day_of_week: '0', start_time: '', end_time: ''
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/timetable', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to fetch timetable');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  const handleEdit = (ev) => {
    setEditingId(ev.id);
    setFormData({
      course_code: ev.course_code,
      course_name: ev.course_name,
      lecturer: ev.lecturer,
      location: ev.location,
      day_of_week: ev.day_of_week.toString(),
      start_time: ev.start_time,
      end_time: ev.end_time
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      const res = await fetch(`/api/admin/timetable/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setEvents(events.filter(e => e.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/timetable/${editingId}` : '/api/admin/timetable';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        day_of_week: parseInt(formData.day_of_week, 10)
      };

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      // Reset form & Refresh
      setEditingId(null);
      setFormData({ course_code: '', course_name: '', lecturer: '', location: '', day_of_week: '0', start_time: '', end_time: '' });
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const daysMap = { 0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday' };

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">
            ADM
          </div>
          <h1 className="text-xl font-bold text-gray-800">Admin Control Center</h1>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-sm">
             {user?.student_number}
           </span>
           <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold text-sm transition-colors">
             <LogOut size={16} /> LOGOUT
           </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-[#1A935A]" /> Timetable Management
          </h2>
          <p className="text-sm text-gray-500 mb-6">Manage the default base timetable events here. Any changes here will instantly update the mock generated `.ics` feeds for all students.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1 bg-gray-50 p-4 border border-gray-200 rounded-sm h-fit">
              <h3 className="font-bold text-gray-700 mb-4">{editingId ? 'Edit Event' : 'Add New Event'}</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Course Code</label>
                  <input required value={formData.course_code} onChange={e => setFormData({...formData, course_code: e.target.value})} type="text" placeholder="e.g. BSE 3201" className="w-full border px-3 py-2 text-sm focus:ring-1 focus:ring-[#1A935A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Course Name</label>
                  <input required value={formData.course_name} onChange={e => setFormData({...formData, course_name: e.target.value})} type="text" placeholder="e.g. System Integration" className="w-full border px-3 py-2 text-sm focus:ring-1 focus:ring-[#1A935A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Lecturer</label>
                  <input required value={formData.lecturer} onChange={e => setFormData({...formData, lecturer: e.target.value})} type="text" placeholder="e.g. Dr. Richard" className="w-full border px-3 py-2 text-sm focus:ring-1 focus:ring-[#1A935A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                  <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} type="text" placeholder="e.g. Block A" className="w-full border px-3 py-2 text-sm focus:ring-1 focus:ring-[#1A935A] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Day of Week</label>
                  <select required value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} className="w-full border px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-[#1A935A] outline-none">
                    <option value="0">Monday</option>
                    <option value="1">Tuesday</option>
                    <option value="2">Wednesday</option>
                    <option value="3">Thursday</option>
                    <option value="4">Friday</option>
                    <option value="5">Saturday</option>
                    <option value="6">Sunday</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
                    <input required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} type="time" className="w-full border px-3 py-2 text-sm focus:ring-1 focus:ring-[#1A935A] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
                    <input required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} type="time" className="w-full border px-3 py-2 text-sm focus:ring-1 focus:ring-[#1A935A] outline-none" />
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button type="submit" className="flex-1 bg-[#1A935A] text-white py-2 font-bold text-sm hover:bg-[#147a4a] transition-colors rounded-sm shadow-sm flex justify-center items-center gap-2">
                    {editingId ? <Edit2 size={16}/> : <Plus size={16}/>} {editingId ? 'Update' : 'Add'} Event
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setFormData({course_code:'', course_name:'', lecturer:'', location:'', day_of_week:'0', start_time:'', end_time:''}); }} className="flex-1 bg-gray-200 text-gray-700 py-2 font-bold text-sm hover:bg-gray-300 transition-colors rounded-sm shadow-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                    <th className="p-3 font-semibold">Course</th>
                    <th className="p-3 font-semibold">Lecturer & Loc</th>
                    <th className="p-3 font-semibold">Schedule</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="4" className="p-4 text-center text-gray-500">Loading events...</td></tr>}
                  {!loading && events.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-500">No events found</td></tr>}
                  {!loading && events.map((ev) => (
                    <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{ev.course_code}</div>
                        <div className="text-xs text-gray-500">{ev.course_name}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-800">{ev.lecturer}</div>
                        <div className="text-xs text-gray-500">{ev.location}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-semibold text-gray-800">{daysMap[ev.day_of_week]}</div>
                        <div className="text-xs text-gray-500">{ev.start_time} - {ev.end_time}</div>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleEdit(ev)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-sm mr-2 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-sm transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

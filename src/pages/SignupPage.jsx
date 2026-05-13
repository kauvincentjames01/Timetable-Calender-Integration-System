import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setAuthToken, getUserContext } from '../lib/authHelpers';

export default function SignupPage() {
  const [studentNumber, setStudentNumber] = useState('');
  const [staffId, setStaffId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { 
        password, 
        role,
        ...(role === 'admin' ? { staff_id: staffId, name } : { student_number: studentNumber })
      };

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Automatically log them in after signup
      const loginPayload = {
        password,
        ...(role === 'admin' ? { staff_id: staffId } : { student_number: studentNumber })
      };

      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginPayload),
      });

      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
        setAuthToken(loginData.token);
        
        const user = getUserContext();
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
         // Login failed for some reason, redirect to manual login
         navigate('/login');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-md shadow-md border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1A935A] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">Mak</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Student Portal Signup</h2>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Role</label>
            <select 
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1A935A] focus:ring-1 focus:ring-[#1A935A] bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          {role === 'admin' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input 
                type="text"
                required
                placeholder="e.g. John Doe"
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1A935A] focus:ring-1 focus:ring-[#1A935A]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          {role === 'student' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Student Number</label>
              <input 
                type="text"
                required
                placeholder="e.g. 23/U/16751/PS"
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1A935A] focus:ring-1 focus:ring-[#1A935A]"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Staff ID</label>
              <input 
                type="text"
                required
                placeholder="e.g. MAK-STAFF-001"
                className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1A935A] focus:ring-1 focus:ring-[#1A935A]"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password"
              required
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1A935A] focus:ring-1 focus:ring-[#1A935A]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1A935A] hover:bg-[#147a4a] text-white font-bold py-2 px-4 rounded-sm transition-colors text-sm disabled:opacity-70 mt-2"
          >
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1A935A] font-bold hover:underline">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

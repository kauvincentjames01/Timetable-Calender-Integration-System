import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setAuthToken, getUserContext } from '../lib/authHelpers';

export default function LoginPage() {
  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ student_number: studentNumber, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      setAuthToken(data.token);
      
      const user = getUserContext();
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
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
          <h2 className="text-2xl font-bold text-gray-800">Student Portal Login</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Student Number / Staff ID</label>
            <input 
              type="text"
              required
              placeholder="Enter your Student No or Staff ID"
              className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1A935A] focus:ring-1 focus:ring-[#1A935A]"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
            />
          </div>
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
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
          Do not have an account?{' '}
          <Link to="/signup" className="text-[#1A935A] font-bold hover:underline">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TimetablePage from './pages/TimetablePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route 
            path="/dashboard" 
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            } 
          />
          <Route 
            path="/timetable" 
            element={
              <DashboardLayout>
                <TimetablePage />
              </DashboardLayout>
            } 
          />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

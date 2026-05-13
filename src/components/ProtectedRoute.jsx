import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUserContext } from '../lib/authHelpers';

export default function ProtectedRoute({ allowedRole }) {
  const user = getUserContext();

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Logged in but wrong role, redirect to appropriate dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Authorized, render the child routes
  return <Outlet />;
}

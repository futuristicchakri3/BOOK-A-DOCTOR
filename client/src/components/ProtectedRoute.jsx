import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 mt-5">
        <Loader minHeight="60vh" />
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="glass-card p-5 max-width-600 mx-auto">
          <i className="bi bi-exclamation-triangle-fill text-danger display-3 mb-3"></i>
          <h2 className="mb-3">Access Denied</h2>
          <p className="text-secondary mb-4">
            You do not have the required role privileges to access this page.
          </p>
          <a href="/" className="btn btn-gradient-primary">
            Go back to Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

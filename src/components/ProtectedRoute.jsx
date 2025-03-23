import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { account, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!account) {
        return <Navigate to="/" replace />;
    }

    if (!role) {
        return <Navigate to="/registration" replace />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import WalletConnect from './components/connectWallet';
import RegistrationForm from './components/RegistrationForm';
import BorrowerDashboard from './components/BorrowerDashboard';
import LenderDashboard from './components/LenderDashboard';
import RequestForm from './components/RequestForm';
import PendingRequests from './components/PendingRequests';
import ActiveLoans from './components/ActiveLoans';
import Navbar from './components/navbar';
import './App.css';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized">
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<WalletConnect />} />
            <Route path="/registration" element={<RegistrationForm />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected routes */}
            <Route
              path="/borrower-dashboard"
              element={
                <ProtectedRoute allowedRoles={['borrower']}>
                  <BorrowerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lender-dashboard"
              element={
                <ProtectedRoute allowedRoles={['lender']}>
                  <LenderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-form"
              element={
                <ProtectedRoute allowedRoles={['borrower']}>
                  <RequestForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pending-requests"
              element={
                <ProtectedRoute allowedRoles={['lender']}>
                  <PendingRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/active-loans"
              element={
                <ProtectedRoute allowedRoles={['lender', 'borrower']}>
                  <ActiveLoans />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

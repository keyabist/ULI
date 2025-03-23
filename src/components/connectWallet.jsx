import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './connectWallet.css';

const WalletConnect = () => {
  const { connectWallet, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleConnect = async () => {
    const result = await connectWallet();
    if (result) {
      const { role } = result;
      // Redirect based on role
      if (role === 'borrower') {
        navigate('/borrower-dashboard');
      } else if (role === 'lender') {
        navigate('/lender-dashboard');
      } else {
        // If not registered, redirect to registration
        navigate('/registration');
      }
    }
  };

  return (
    <div className="connect-wallet-container">
      <div className="connect-wallet-card">
        <h1>Welcome to ULI</h1>
        <p>Connect your wallet to get started</p>
        {error && <p className="error-message">{error}</p>}
        <button
          className="connect-button"
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  );
};

export default WalletConnect;

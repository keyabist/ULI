import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import contractABI from '../contracts/abi.json';
import NavBar from './navbar';
import './RequestForm.css';

const contractAddress = '0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F';

const RequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const lender = location.state?.lender;
  const [formData, setFormData] = useState({
    amount: '',
    duration: '',
  });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask to use this application");
        }

        // Check if already connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          // Request connection
          const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
          }
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0]);
          } else {
            setAccount(null);
            navigate('/borrowerDashboard');
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Error checking connection:", error);
        setError(error.message || "Failed to connect to wallet");
      }
    };

    checkConnection();
  }, [navigate]);

  useEffect(() => {
    if (!lender || !account) {
      navigate('/borrowerDashboard');
    }
  }, [lender, account, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // Validate form data
      if (!formData.amount || !formData.duration) {
        throw new Error('Please fill in all fields');
      }

      const amount = ethers.parseEther(formData.amount);
      const duration = parseInt(formData.duration);

      // Validate against lender's maximum loan amount
      const maxAmount = lender.maxLoanAmount;
      if (amount > maxAmount) {
        throw new Error(`Amount exceeds maximum loan amount of ${ethers.formatEther(maxAmount)} ETH`);
      }

      // Validate duration
      if (duration < 1) {
        throw new Error('Duration must be at least 1 day');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Check if user is already a borrower
      const borrower = await contract.borrowers(account);
      if (!borrower.isRegistered) {
        throw new Error('Please register as a borrower first');
      }

      const tx = await contract.requestLoan(
        lender.address,
        amount,
        duration
      );

      await tx.wait();
      navigate('/borrowerDashboard');
    } catch (error) {
      console.error('Error requesting loan:', error);
      setError(error.message || 'Failed to request loan. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!lender || !account) {
    return (
      <>
        <NavBar />
        <div className="request-form-container">
          <div className="request-form-card">
            <div className="error-state">
              <p>Please connect your wallet and select a lender to continue</p>
              <button onClick={() => navigate('/borrowerDashboard')}>Go Back</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="request-form-container">
        <div className="request-form-card">
          <div className="request-form-header">
            <h1>Request Loan</h1>
            <p>Submit your loan request to {lender.name}</p>
          </div>

          <div className="lender-info">
            <h3>Lender Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name</span>
                <span className="info-value">{lender.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Interest Rate</span>
                <span className="info-value">{lender.interestRate}%</span>
              </div>
              <div className="info-item">
                <span className="info-label">Max Loan Amount</span>
                <span className="info-value">{ethers.formatEther(lender.maxLoanAmount)} ETH</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contact</span>
                <span className="info-value">{lender.email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group">
              <label htmlFor="amount">Loan Amount (ETH)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount in ETH"
                step="0.000000000000000001"
                min="0"
                max={ethers.formatEther(lender.maxLoanAmount)}
                required
                disabled={processing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (days)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Enter duration in days"
                min="1"
                required
                disabled={processing}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate('/borrowerDashboard')}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RequestForm;

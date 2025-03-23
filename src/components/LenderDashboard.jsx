import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { ethers } from 'ethers';
import Navbar from './navbarLender';
import { contractConfig } from '../contractConfig';
import './LenderDashboard.css';

const LenderDashboard = () => {
  const [stats, setStats] = useState({
    totalActiveLoans: 0,
    totalPendingRequests: 0,
    totalLentAmount: '0 ETH',
    totalPendingAmount: '0 ETH',
  });

  const [activeLoans, setActiveLoans] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchLoansForLender = async () => {
      if (!window.ethereum) {
        console.error('MetaMask is not installed.');
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress(); // Currently connected lender
        const contract = new ethers.Contract(
          contractConfig.contractAddress,
          contractConfig.abi,
          signer
        );

        // Get the total number of loans created so far
        const totalLoansBN = await contract.nextLoanId(); // Native BigInt now
        const totalLoans = Number(totalLoansBN); // Convert BigInt to Number

        const tempActive = [];
        const tempPending = [];

        // Enumerate all loans from ID 1 to nextLoanId - 1
        for (let loanId = 1; loanId < totalLoans; loanId++) {
          const loan = await contract.loans(loanId);
          // Compare addresses in lowercase
          if (loan.lender.toLowerCase() === userAddress.toLowerCase()) {
            const status = Number(loan.status); // Convert BigInt status to number
            if (status === 0) {
              tempPending.push(loan);
            } else if (status === 1) {
              tempActive.push(loan);
            }
          }
        }

        // Sum amounts for each category
        const sumPending = tempPending.reduce((acc, loan) => {
          return acc + parseFloat(ethers.formatUnits(loan.amount, 'ether'));
        }, 0);

        const sumActive = tempActive.reduce((acc, loan) => {
          return acc + parseFloat(ethers.formatUnits(loan.amount, 'ether'));
        }, 0);

        setPendingRequests(tempPending);
        setActiveLoans(tempActive);

        setStats({
          totalActiveLoans: tempActive.length,
          totalPendingRequests: tempPending.length,
          totalLentAmount: `${sumActive} ETH`,
          totalPendingAmount: `${sumPending} ETH`,
        });
      } catch (err) {
        console.error('Error fetching lender loans:', err);
      }
    };

    fetchLoansForLender();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>Lender Statistics</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalActiveLoans}</div>
              <div className="stat-label">Total Loans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{ethers.formatEther(ethers.parseEther(stats.totalLentAmount))}</div>
              <div className="stat-label">Total Amount Lent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalActiveLoans}</div>
              <div className="stat-label">Active Loans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.totalPendingRequests}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3>Loan Requests</h3>
          </div>
          <div className="loan-list">
            {pendingRequests.map((request) => (
              <div key={request.id} className="loan-card">
                <div className="loan-info">
                  <p>
                    <span>Borrower:</span>
                    {request.borrower}
                  </p>
                  <p>
                    <span>Amount:</span>
                    {ethers.formatEther(request.amount)} ETH
                  </p>
                  <p>
                    <span>Interest Rate:</span>
                    {request.interestRate}%
                  </p>
                  <p>
                    <span>Duration:</span>
                    {request.duration} days
                  </p>
                  <p>
                    <span>Status:</span>
                    <span className={`status-badge status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </p>
                </div>
                {request.status === 'Pending' && (
                  <div className="action-buttons">
                    <button
                      className="action-button approve-button"
                      onClick={() => handleApprove(request.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="action-button reject-button"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {pendingRequests.length === 0 && (
              <div className="empty-state">
                <p>No loan requests found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import contractABI from "../contracts/abi.json";
import NavBar from "./navbar";
import './LoanList.css';

const contractAddress = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

const ActiveLoans = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveLoans();
  }, []);

  const fetchActiveLoans = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const nextLoanIdBN = await contract.nextLoanId();
      const nextLoanId = Number(nextLoanIdBN);

      let loans = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        if (
          (loan.borrower.toLowerCase() === userAddress.toLowerCase() ||
            loan.lender.toLowerCase() === userAddress.toLowerCase()) &&
          Number(loan.status) === 1
        ) {
          loans.push({
            id: loan.loanId.toString(),
            borrower: loan.borrower,
            lender: loan.lender,
            amount: loan.amount,
            interestRate: parseFloat(loan.interestRate.toString()),
            duration: loan.repaymentPeriod.toString(),
            startTime: loan.startTime.toString(),
            status: "Active"
          });
        }
      }
      setActiveLoans(loans);
    } catch (error) {
      console.error("Error fetching active loans:", error);
    }
  };

  const handleViewDetails = (loanId) => {
    navigate(`/loanStatus/${loanId}`);
  };

  return (
    <>
      <NavBar />
      <div className="loan-list-container">
        <div className="loan-list-header">
          <h1>Active Loans</h1>
          <p>View and manage your active loans</p>
        </div>

        <div className="loan-grid">
          {activeLoans.map((loan) => (
            <div key={loan.id} className="loan-card">
              <div className="loan-card-header">
                <span className="loan-card-title">Loan #{loan.id}</span>
                <span className="loan-card-status status-active">Active</span>
              </div>

              <div className="loan-info">
                <div className="loan-info-item">
                  <span className="loan-info-label">Amount</span>
                  <span className="loan-info-value">{ethers.formatEther(loan.amount)} ETH</span>
                </div>
                <div className="loan-info-item">
                  <span className="loan-info-label">Interest Rate</span>
                  <span className="loan-info-value">{loan.interestRate}%</span>
                </div>
                <div className="loan-info-item">
                  <span className="loan-info-label">Duration</span>
                  <span className="loan-info-value">{loan.duration} days</span>
                </div>
                <div className="loan-info-item">
                  <span className="loan-info-label">Start Date</span>
                  <span className="loan-info-value">
                    {new Date(Number(loan.startTime) * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="loan-info-item">
                  <span className="loan-info-label">Borrower</span>
                  <span className="loan-info-value">{loan.borrower.slice(0, 6)}...{loan.borrower.slice(-4)}</span>
                </div>
                <div className="loan-info-item">
                  <span className="loan-info-label">Lender</span>
                  <span className="loan-info-value">{loan.lender.slice(0, 6)}...{loan.lender.slice(-4)}</span>
                </div>
              </div>

              <button
                className="view-button"
                onClick={() => handleViewDetails(loan.id)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {activeLoans.length === 0 && (
          <div className="empty-state">
            <p>No active loans found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ActiveLoans;

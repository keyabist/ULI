import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import { useNavigate } from "react-router-dom";
import NavBar from "./navbar";
import './LoanList.css';

const contractAddress = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

const PendingRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const nextLoanIdBN = await contract.nextLoanId();
      const nextLoanId = Number(nextLoanIdBN);

      let requests = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        if (
          loan.lender.toLowerCase() === userAddress.toLowerCase() &&
          Number(loan.status) === 0
        ) {
          requests.push({
            id: loan.loanId.toString(),
            borrower: loan.borrower,
            amount: loan.amount,
            interestRate: parseFloat(loan.interestRate.toString()),
            duration: loan.repaymentPeriod.toString(),
            status: "Pending"
          });
        }
      }
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      setProcessing(loanId);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.approveLoan(loanId);
      await tx.wait();

      // Refresh the list after approval
      fetchPendingRequests();
    } catch (error) {
      console.error("Error approving loan:", error);
      alert("Failed to approve the loan. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectLoan = async (loanId) => {
    try {
      setProcessing(loanId);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.rejectLoan(loanId);
      await tx.wait();

      // Refresh the list after rejection
      fetchPendingRequests();
    } catch (error) {
      console.error("Error rejecting loan:", error);
      alert("Failed to reject the loan. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <NavBar />
      <div className="loan-list-container">
        <div className="loan-list-header">
          <h1>Pending Requests</h1>
          <p>Review and manage loan requests from borrowers</p>
        </div>

        <div className="loan-grid">
          {pendingRequests.map((request) => (
            <div key={request.id} className="loan-card">
              <div className="loan-card-header">
                <span className="loan-card-title">Loan Request #{request.id}</span>
                <span className="loan-card-status status-pending">Pending</span>
              </div>

              <div className="loan-info">
                <div className="loan-info-item">
                  <span className="loan-info-label">Amount</span>
                  <span className="loan-info-value">{ethers.formatEther(request.amount)} ETH</span>
                </div>
                <div className="loan-info-item">
                  <span className="loan-info-label">Interest Rate</span>
                  <span className="loan-info-value">{request.interestRate}%</span>
                </div>
                <div className="loan-info-item">
                  <span className="loan-info-label">Duration</span>
                  <span className="loan-info-value">{request.duration} days</span>
                </div>
                <div className="loan-info-item">
                  <span className="loan-info-label">Borrower</span>
                  <span className="loan-info-value">{request.borrower.slice(0, 6)}...{request.borrower.slice(-4)}</span>
                </div>
              </div>

              <div className="loan-actions">
                <button
                  className="action-button approve-button"
                  onClick={() => handleApproveLoan(request.id)}
                  disabled={processing === request.id}
                >
                  {processing === request.id ? "Processing..." : "Approve"}
                </button>
                <button
                  className="action-button reject-button"
                  onClick={() => handleRejectLoan(request.id)}
                  disabled={processing === request.id}
                >
                  {processing === request.id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {pendingRequests.length === 0 && (
          <div className="empty-state">
            <p>No pending requests found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PendingRequests;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { contractConfig } from '../contractConfig';

const LoanRequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve lender data passed from BorrowerDashboard
  const lender = location.state?.lender;
  if (!lender) {
    return <p>Error: Lender data not found. Please go back and select a lender.</p>;
  }
  
  const [formData, setFormData] = useState({
    amountNeeded: '',
    repaymentPeriod: '',
    repaymentSchedule: ''  // For UI only; not stored on-chain.
  });
  
  // Generate a random UI reference ID (for display/logging only)
  const [uiLoanId, setUiLoanId] = useState('');
  useEffect(() => {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    setUiLoanId(`${Date.now()}-${randomPart}`);
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Connect to MetaMask and get the signer (borrower's account)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
  
      // Create contract instance using the signer for write access.
      const contract = new ethers.Contract(contractConfig.contractAddress, contractConfig.abi, signer);
  
      // Call the blockchain function requestLoan to store the loan data.
      const tx = await contract.requestLoan(
        ethers.parseUnits(formData.amountNeeded, 'ether'),
        parseInt(formData.repaymentPeriod),
        lender.walletAddress
      );
  
      // Wait for transaction confirmation
      await tx.wait();
  
      // Fetch nextLoanId and subtract 1 to get the loan just stored.
      const nextLoanIdBN = await contract.nextLoanId();
      const loanId = Number(nextLoanIdBN) - 1;
      const loan = await contract.loans(loanId);
      console.log("Stored Loan Data:", {
        loanId: loan.loanId.toString(),
        borrower: loan.borrower,
        lender: loan.lender,
        amount: ethers.formatEther(loan.amount) + " ETH",
        repaymentPeriod: loan.repaymentPeriod.toString() + " months",
        status: Number(loan.status), // 0 for Pending
        interestRate: loan.interestRate.toString(),
      });
  
      console.log("Loan request submitted on-chain. UI Loan Reference ID:", uiLoanId);
      alert("Loan request submitted successfully!");
      navigate("/borrowerDashboard");
    } catch (error) {
      console.error("Error submitting loan request:", error);
      alert("Failed to submit loan request. Check the console for details.");
    }
  };
  
  
  return (
    <div className="loan-request-container">
      <h2>Loan Request Form</h2>
      
      <p><strong>Lender Address:</strong> {lender.walletAddress}</p>
      <p><strong>Lender Interest Rate:</strong> {lender.interestRate}</p>
      <p><strong>Your UI Loan Reference ID:</strong> {uiLoanId}</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount Needed (in ETH):</label>
          <input
            type="number"
            name="amountNeeded"
            value={formData.amountNeeded}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Repayment Period (in months):</label>
          <input
            type="number"
            name="repaymentPeriod"
            value={formData.repaymentPeriod}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Repayment Schedule:</label>
          <select
            name="repaymentSchedule"
            value={formData.repaymentSchedule}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Schedule</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        
        <button type="submit">Submit Loan Request</button>
      </form>
    </div>
  );
};

export default LoanRequestForm;

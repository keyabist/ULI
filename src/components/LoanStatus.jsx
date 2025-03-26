import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import NavBar from "./navbar"; // For borrowers
import NavbarLender from "./navbarLender"; // For lenders

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const LoanStatus = () => {
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [isBorrower, setIsBorrower] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        if (!loanId) {
          console.error("Loan ID is undefined!");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const signerAddress = (await signer.getAddress()).toLowerCase();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const loanData = await contract.loans(loanId);
        if (!loanData) {
          console.error("Loan data is undefined or empty!");
          return;
        }

        const totalAmount = parseFloat(ethers.formatEther(loanData.amount));
        const amountPaid = parseFloat(ethers.formatEther(loanData.amountPaid));
        const rawInterestRate = parseFloat(ethers.formatEther(loanData.interestRate)) || 0.05;
        const interest = totalAmount * rawInterestRate;
        const remainingAmount = totalAmount + interest - amountPaid;
        const duration = Number(loanData.repaymentPeriod); // number of months
        // Calculate next installment as (total payable amount divided by repayment period)
        const nextInstallment = (totalAmount + interest) / duration;

        setLoan({
          loanId: loanData.loanId.toString(),
          borrower: loanData.borrower,
          amount: totalAmount.toFixed(6),
          amountPaid: amountPaid.toFixed(6),
          interestRate: (rawInterestRate * 100).toFixed(2) + "%", // display as percentage
          amountRemaining: remainingAmount.toFixed(6),
          duration: loanData.repaymentPeriod.toString(),
          status: Number(loanData.status),
          nextInstallment: nextInstallment.toFixed(6),
          lender: loanData.lender,
        });

        setIsBorrower(signerAddress === loanData.borrower.toLowerCase());
      } catch (error) {
        console.error("Error fetching loan details:", error);
      }
    };

    fetchLoanDetails();
  }, [loanId]);

  const handlePaymentClick = () => {
    // Navigate to transactionPage with loanId, installment amount, and lender details
    navigate("/transactionPage", { 
      state: { 
        loanId: loan.loanId, 
        installmentAmount: loan.nextInstallment, 
        recipient: loan.lender, 
        role: 'borrower'
      } 
    });
  };

  return (
    <div style={{
      width: "90%",
      margin: "auto",
      padding: "30px",
      borderRadius: "10px",
      backgroundColor: "white",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
    }}>
      {isBorrower ? <NavBar /> : <NavbarLender />}
      <h2 style={{ textAlign: "left", color: "#333", marginBottom: "20px" }}>📜 Loan Status</h2>

      {loan ? (
        <div style={{ 
          textAlign: "left", 
          fontSize: "16px", 
          lineHeight: "1.8",
          color: "#222"
        }}>
          <p style={{ marginBottom: "10px" }}>🔹 <b>Loan ID:</b> {loan.loanId}</p>
          <p style={{ marginBottom: "10px" }}>🧑 <b>Borrower:</b> {loan.borrower}</p>
          <p style={{ marginBottom: "10px" }}>💰 <b>Total Amount:</b> {loan.amount} ETH</p>
          <p style={{ marginBottom: "10px" }}>✅ <b>Amount Paid:</b> {loan.amountPaid} ETH</p>
          <p style={{ marginBottom: "10px" }}>💸 <b>Amount Remaining:</b> {loan.amountRemaining} ETH</p>
          <p style={{ marginBottom: "10px" }}>📈 <b>Interest Rate:</b> {loan.interestRate}</p>
          <p style={{ marginBottom: "10px" }}>⏳ <b>Duration Left:</b> {loan.duration} Months</p>
          <p style={{ marginBottom: "10px" }}>🔍 <b>Status:</b> {loan.status === 0 ? "Pending Approval" : loan.status === 1 ? "Approved" : loan.status === 3 ? "Completed" : "Other"}</p>
          {loan.status === 1 && isBorrower && (
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#00d1b2",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "20px"
              }}
              onClick={handlePaymentClick}
            >
              Pay Next Installment ({loan.nextInstallment} ETH)
            </button>
          )}
        </div>
      ) : (
        <p style={{ color: "#222" }}>Loading Loan Details...</p>
      )}
    </div>
  );
};

export default LoanStatus;

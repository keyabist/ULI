import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useLocation } from "react-router-dom";
import contractABI from "../contracts/abi.json";

const contractAddress = "0x4d20B7131ac08bba92b885188d0980d2C2dea68f";

const LoanStatus = () => {
  const { state } = useLocation();
  const loanId = state?.loanId || null;
  const [loan, setLoan] = useState(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [pendingAmount, setPendingAmount] = useState("");
  const [durationLeft, setDurationLeft] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  // ✅ Fetch loan details if not available in state
  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        if (!loanId) {
          console.error("Loan ID is undefined!");
          return;
        }
  
        console.log("Fetching loan details for ID:", loanId);
  
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
        const loanData = await contract.loans(loanId);
  
        console.log("Loan Data from contract:", loanData);
  
        if (!loanData) {
          console.error("Loan data is undefined or empty!");
          return;
        }
  
        setLoan({
          loanId: loanData.loanId,
          borrower: loanData.borrower,
          amount: ethers.formatEther(loanData.amount),
          amountPaid: ethers.formatEther(loanData.amountPaid),
          duration: loanData.duration,
        });
  
        setAmountPaid(ethers.formatEther(loanData.amountPaid));
        setPendingAmount(ethers.formatEther(loanData.amount - loanData.amountPaid));
        setDurationLeft(`${loanData.duration} Days`);
      } catch (error) {
        console.error("Error fetching loan details:", error);
      }
    };
  
    fetchLoanDetails();
  }, [loanId]);
  

  // ✅ Handle loan payments
  const handlePayment = async () => {
    try {
      if (!loan) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const transaction = await contract.recordPayment(
        loan.loanId,
        { value: ethers.parseEther(paymentAmount) }
      );
      await transaction.wait();
      alert("Payment Successful!");
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment Failed!");
    }
  };

  return (
    <div style={{ padding: "40px", color: "white", backgroundColor: "#1A3A6A", minHeight: "100vh" }}>
      <h2>Loan Status</h2>

      {loan ? (
        <div style={{ padding: "20px", border: "3px solid #00d1b2", borderRadius: "10px", backgroundColor: "#394867", color: "white" }}>
          <p>Loan ID: {loan.loanId}</p>
          <p>Amount Paid: {amountPaid} ETH</p>
          <p>Pending Amount: {pendingAmount} ETH</p>
          <p>Duration Left: {durationLeft}</p>
        </div>
      ) : (
        <p>Loading Loan Details...</p>
      )}

      {pendingAmount > 0 && (
        <div>
          <input
            type="number"
            placeholder="Enter Installment Amount"
            style={{ padding: "10px", marginRight: "10px", borderRadius: "5px", border: "none" }}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <button 
            style={{ padding: "10px 20px", backgroundColor: "#00d1b2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} 
            onClick={() => navigate(`/transactionpage`)}
          >
            Pay Next Installment
          </button>
        </div>
      )}
    </div>
  );
};

export default LoanStatus;

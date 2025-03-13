import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  // Fetch loan details from blockchain
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

        // Set loan details including status (0 = Pending, 1 = Approved, 3 = Completed)
        setLoan({
          loanId: loanData.loanId.toString(),
          borrower: loanData.borrower,
          amount: ethers.formatEther(loanData.amount),
          amountPaid: ethers.formatEther(loanData.amountPaid),
          duration: loanData.repaymentPeriod.toString(), // repaymentPeriod from your contract
          status: Number(loanData.status)
        });

        setAmountPaid(ethers.formatEther(loanData.amountPaid));
        // Calculate pending amount (using BigNumber subtraction)
        const pending = ethers.formatEther(loanData.amount.sub(loanData.amountPaid));
        setPendingAmount(pending);
        setDurationLeft(`${loanData.repaymentPeriod.toString()} Days`);
      } catch (error) {
        console.error("Error fetching loan details:", error);
      }
    };

    fetchLoanDetails();
  }, [loanId]);

  // Redirect to TransactionPage (passing loanId via state)
  const handlePaymentRedirect = () => {
    navigate(`/transactionpage`, { state: { loanId: loan.loanId } });
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
          <p>Status: {loan.status === 0 ? "Pending Approval" : loan.status === 1 ? "Approved" : loan.status === 3 ? "Completed" : "Other"}</p>
        </div>
      ) : (
        <p>Loading Loan Details...</p>
      )}

      {/* Render appropriate action based on loan status */}
      {loan && loan.status === 0 && (
        <p>Loan Request is still Pending Approval.</p>
      )}

      {loan && loan.status === 1 && (
       
          <div>
            {/* Optionally, you might include an input for payment amount if needed */}
            <button 
              style={{ padding: "10px 20px", backgroundColor: "#00d1b2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} 
              onClick={handlePaymentRedirect}
            >
              Make Payment
            </button>
          </div>
        
      )}

      {loan && loan.status === 3 && (
        <p>Loan Fully Repaid</p>
      )}
    </div>
  );
};

export default LoanStatus;

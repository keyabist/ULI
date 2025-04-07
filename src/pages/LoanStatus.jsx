import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import Sidebar from "../components/Sidebar";
import AnimatedList from "../components/AnimatedList"; // New animated list component

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const LoanStatus = () => {
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isBorrower, setIsBorrower] = useState(false);
  const [userRole, setUserRole] = useState(""); // Added userRole state
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

        // Check if user is a borrower or lender to set userRole
        const borrowerData = await contract.borrowers(signerAddress);
        if (borrowerData[6]) { // isRegistered field
          setUserRole("borrower");
        } else {
          const lenderData = await contract.lenders(signerAddress);
          if (lenderData[7]) { // isRegistered field
            setUserRole("lender");
          }
        }

        // Fetch loan details
        const loanData = await contract.loans(loanId);
        if (!loanData) {
          console.error("Loan data is undefined or empty!");
          return;
        }

        // Convert raw values
        const totalAmount = parseFloat(ethers.formatEther(loanData.amount));
        const amountPaid = parseFloat(ethers.formatEther(loanData.amountPaid));
        const rawInterestRate = parseFloat(ethers.formatEther(loanData.interestRate)) || 0.05;
        const interest = totalAmount * rawInterestRate;
        const remainingAmount = totalAmount + interest - amountPaid;
        const duration = Number(loanData.repaymentPeriod);
        const nextInstallment = (totalAmount + interest) / duration;

        // Fetch borrower profile to display the username
        const borrowerProfile = await contract.getBorrowerProfile(loanData.borrower);
        const borrowerName = borrowerProfile.name;

        setLoan({
          loanId: loanData.loanId.toString(),
          borrowerAddress: loanData.borrower,
          borrowerName, // fetched from profile
          amount: totalAmount.toFixed(6),
          amountPaid: amountPaid.toFixed(6),
          interestRate: (rawInterestRate * 100).toFixed(2) + "%",
          amountRemaining: remainingAmount.toFixed(6),
          duration: loanData.repaymentPeriod.toString(),
          status: Number(loanData.status),
          nextInstallment: nextInstallment.toFixed(6),
          lender: loanData.lender,
        });

        setIsBorrower(signerAddress === loanData.borrower.toLowerCase());

        // Fetch transaction history for this loan (assuming your contract has a getTransactions function)
        const txHistory = await contract.getTransactions(loanId);
        if (txHistory && txHistory.length > 0) {
          const formattedTransactions = txHistory.map((tx, index) => {
            // Convert timestamp from seconds to milliseconds and create a date string
            const date = new Date(Number(tx.timestamp) * 1000).toLocaleString();
            const amountEth = parseFloat(ethers.formatEther(tx.amount)).toFixed(6);
            return (
              <div key={index} style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                border: "1px solid #00ff80",
                borderRadius: "8px",
                padding: "10px",
                backgroundColor: "#1a1a1a"
              }}>
                <p style={{ margin: 0 }}><strong>Loan ID:</strong> {tx.loanId.toString()}</p>
                <p style={{ margin: 0 }}><strong>From:</strong> {tx.from}</p>
                <p style={{ margin: 0 }}><strong>To:</strong> {tx.to}</p>
                <p style={{ margin: 0 }}><strong>Amount:</strong> {amountEth} ETH</p>
                <p style={{ margin: 0 }}><strong>Timestamp:</strong> {date}</p>
              </div>
            );
          });
          setTransactions(formattedTransactions);
        }
      } catch (error) {
        console.error("Error fetching loan details:", error);
      }
    };

    fetchLoanDetails();
  }, [loanId]);

  const handlePaymentClick = () => {
    navigate("/transactionPage", {
      state: {
        loanId: loan.loanId,
        installmentAmount: loan.nextInstallment,
        recipient: loan.lender,
        role: "borrower"
      }
    });
  };

  return (
    <div style={{
      maxWidth: "500px",
      margin: "40px auto",
      padding: "30px",
      background: "#2E2E2E",  // Dark grey background
      border: "2px solid #00ff80",
      borderRadius: "12px",
      boxShadow: "0 0 20px 5px rgba(0, 255, 128, 0.6)",
      color: "#d4edda",
      fontFamily: "'Poppins', sans-serif"
    }}>
      <Sidebar /> {/* Removed the role prop as Sidebar now determines role internally */}
      <h2 style={{
        textAlign: "center",
        color: "#00ff80",
        marginBottom: "20px",
        fontSize: "2rem"
      }}>
        📜 Loan Status
      </h2>

      {loan ? (
        <div style={{
          textAlign: "center",
          fontSize: "16px",
          lineHeight: "1.8"
        }}>
          <p style={{ marginBottom: "12px" }}>
            🔹 <b>Loan ID:</b> {loan.loanId}
          </p>
          <p style={{ marginBottom: "12px" }}>
            🧑 <b>Borrower:</b>{" "}
            <Link
              to={`/view-profile/${loan.borrowerAddress}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                color: "#28a745",
                textDecoration: "none",
                fontWeight: "bold",
                marginLeft: "5px"
              }}
            >
              {loan.borrowerName}
            </Link>
          </p>
          <p style={{ marginBottom: "12px" }}>
            💰 <b>Total Amount:</b> {loan.amount} ETH
          </p>
          <p style={{ marginBottom: "12px" }}>
            ✅ <b>Amount Paid:</b> {loan.amountPaid} ETH
          </p>
          <p style={{ marginBottom: "12px" }}>
            💸 <b>Amount Remaining:</b> {loan.amountRemaining} ETH
          </p>
          <p style={{ marginBottom: "12px" }}>
            📈 <b>Interest Rate:</b> {loan.interestRate}
          </p>
          <p style={{ marginBottom: "12px" }}>
            ⏳ <b>Duration Left:</b> {loan.duration} Months
          </p>
          <p style={{ marginBottom: "12px" }}>
            🔍 <b>Status:</b> {loan.status === 0 ? "Pending Approval" : loan.status === 1 ? "Approved" : loan.status === 3 ? "Completed" : "Other"}
          </p>
          {loan.status === 1 && isBorrower && (
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#00d1b2",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "30px",
                fontSize: "1rem",
                fontWeight: "bold"
              }}
              onClick={handlePaymentClick}
            >
              Pay Next Installment ({loan.nextInstallment} ETH)
            </button>
          )}
        </div>
      ) : (
        <p style={{
          textAlign: "center",
          color: "#d4edda",
          fontSize: "18px"
        }}>
          Loading Loan Details...
        </p>
      )}

      <div style={{ marginTop: "40px" }}>
        <h3 style={{
          textAlign: "center",
          color: "#00ff80",
          marginBottom: "20px",
          fontSize: "1.8rem"
        }}>
          Transaction History
        </h3>
        <div style={{
          maxHeight: "300px",
          overflowY: "auto",
          padding: "10px",
          border: "1px solid #00ff80",
          borderRadius: "8px",
          backgroundColor: "#1a1a1a"
        }}>
          {transactions.length > 0 ? (
            <AnimatedList
              items={transactions}
              onItemSelect={(item, index) => console.log(item, index)}
              showGradients={true}
              enableArrowNavigation={true}
              displayScrollbar={true}
            />
          ) : (
            <p style={{
              textAlign: "center",
              color: "#d4edda",
              fontSize: "16px"
            }}>
              No transactions found for this loan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanStatus;
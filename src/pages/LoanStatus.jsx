import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import Sidebar from "../components/Sidebar"; // ✅ Sidebar imported

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const LoanStatus = () => {
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [userRole, setUserRole] = useState("");
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

        const borrowerProfile = await contract.getBorrowerProfile(loanData.borrower);
        const borrowerName = borrowerProfile.name;

        const totalAmount = parseFloat(ethers.formatEther(loanData.amount));
        const amountPaid = parseFloat(ethers.formatEther(loanData.amountPaid));
        const rawInterestRate = parseFloat(ethers.formatEther(loanData.interestRate)) || 0.05;
        const interest = totalAmount * rawInterestRate;
        const remainingAmount = totalAmount + interest - amountPaid;
        const duration = Number(loanData.repaymentPeriod);
        const nextInstallment = (totalAmount + interest) / duration;

        setLoan({
          loanId: loanData.loanId.toString(),
          borrowerAddress: loanData.borrower,
          borrowerName,
          amount: totalAmount.toFixed(6),
          amountPaid: amountPaid.toFixed(6),
          interestRate: (rawInterestRate * 100).toFixed(2) + "%",
          amountRemaining: remainingAmount.toFixed(6),
          duration: loanData.repaymentPeriod.toString(),
          status: Number(loanData.status),
          nextInstallment: nextInstallment.toFixed(6),
          lender: loanData.lender,
        });

        const borrowerData = await contract.borrowers(signerAddress);
        const lenderData = await contract.lenders(signerAddress);
        const role = borrowerData.isRegistered
          ? "borrower"
          : lenderData.isRegistered
          ? "lender"
          : "unknown";

        setUserRole(role);
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
    <div style={{ display: "flex" }}>
      <Sidebar role={userRole} /> {/* ✅ Sidebar shown */}

      <div style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "30px",
        background: "linear-gradient(135deg, #0a0a0a, #222)",
        border: "2px solid #00ff80",
        borderRadius: "12px",
        boxShadow: "0 0 20px 5px rgba(0, 255, 128, 0.6)",
        color: "#d4edda",
        fontFamily: "'Poppins', sans-serif",
        flex: 1
      }}>
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
            {loan.status === 1 && userRole === "borrower" && (
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
      </div>
    </div>
  );
};

export default LoanStatus;

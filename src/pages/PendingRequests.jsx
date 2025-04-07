import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import CustomTable from "../components/CustomTable";
import CustomLoader from "../components/CustomLoader";
import Navbar from "../components/navbarLender";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const PendingRequests = () => {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingLoans = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask not installed");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        const userAddress = (await signer.getAddress()).toLowerCase();
        const loanCount = await contract.nextLoanId();

        const loans = [];
        for (let i = 1; i < loanCount; i++) {
          const loan = await contract.loans(i);
          if (loan.lender.toLowerCase() === userAddress && loan.status.toString() === "0") {
            // Fetch borrower profile for username and credit score
            const borrowerProfile = await contract.getBorrowerProfile(loan.borrower);
            const username = borrowerProfile.name;
            const creditScore = borrowerProfile.creditScore.toString();

            loans.push({
              loanId: i.toString(),
              borrower: (
                <Link
                  to={`/view-profile/${loan.borrower}`}
                  onClick={(e) => e.stopPropagation()} // Prevent row click event
                  style={{ color: "#28a745", textDecoration: "none", fontWeight: "bold" }}
                >
                  {username}
                </Link>
              ),
              creditScore, // New column for credit score
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              term: loan.repaymentPeriod.toString() + " months",
            });
          }
        }
        setPendingLoans(loans);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingLoans();
  }, []);

  const handleApprove = async (loan) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      
      // Get loanId as a number
      const loanId = Number(loan.loanId);
      
      // Get the actual loan data from the contract to get the borrower address
      const loanData = await contract.loans(loanId);
      
      // Get the borrower's address from the contract
      const recipient = loanData.borrower;
      
      // Parse amount from the display string (e.g., "1.5 ETH" -> "1.5")
      const amountString = loan.amount.toString();
      const installmentAmount = amountString.includes(" ETH") 
        ? amountString.split(" ETH")[0] 
        : amountString;
      
      // Approve the loan
     
      // Navigate with proper serializable values
      navigate("/transactionPage", { 
        state: { 
          loanId: loanId, 
          installmentAmount: installmentAmount, 
          recipient: recipient,
          role: "lender"
        } 
      });
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };
  
  const handleReject = async (loan) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not installed");
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  
      const tx = await contract.rejectLoan(loan.loanId);
      await tx.wait(); // Wait for transaction confirmation
  
      console.log("Loan rejected:", loan.loanId);
      setPendingLoans((prev) => prev.filter((l) => l.loanId !== loan.loanId)); // Remove from UI
    } catch (err) {
      console.error("Rejection failed:", err);
    }
  };
  

  const handleRowClick = (row) => {
    // Navigate to loan status page when row (except the name link) is clicked
    navigate(`/loanStatus/${row.loanId}`);
  };

  return (
    <Box sx={{ p: 2, mt: 5}}>
      {/* <Navbar /> */}
      <Typography variant="h4" gutterBottom>
        Pending Loan Requests
      </Typography>

      {loading ? (
        <CustomLoader />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : pendingLoans.length === 0 ? (
        <Typography>No pending requests found.</Typography>
      ) : (
        <CustomTable
          data={pendingLoans}
          columns={[
            { label: "Loan ID", field: "loanId" },
            { label: "Borrower", field: "borrower" },
            { label: "Credit Score", field: "creditScore", align: "right" },
            { label: "Amount", field: "amount", align: "right" },
            { label: "Interest Rate", field: "interestRate", align: "right" },
            { label: "Term", field: "term", align: "right" },
          ]}
          actions={[
            { label: "Approve", onClick: handleApprove, color: "success" },
            { label: "Reject", onClick: handleReject, color: "error" },
          ]}
          onRowClick={handleRowClick}
        />
      )}
    </Box>
  );
};

export default PendingRequests;

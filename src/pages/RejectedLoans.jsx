import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import AnimatedList from "../components/AnimatedList";
import CustomLoader from "../components/CustomLoader";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const RejectedLoans = () => {
  const [rejectedLoans, setRejectedLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRejectedLoans = async () => {
      setLoading(true);
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
          if (loan.lender.toLowerCase() === userAddress && loan.status.toString() === "2") {
            // Fetch borrower profile for username and credit score
            const borrowerProfile = await contract.getBorrowerProfile(loan.borrower);
            const username = borrowerProfile.name;
            const creditScore = borrowerProfile.creditScore.toString();

            loans.push({
              loanId: loan.loanId.toString(),
              borrower: (
                <Link
                  to={`/view-profile/${loan.borrower}`}
                  onClick={(e) => e.stopPropagation()} // Prevent row click event
                  style={{ color: "#28a745", textDecoration: "none", fontWeight: "bold" }}
                >
                  {username}
                </Link>
              ),
              creditScore,
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              term: loan.repaymentPeriod.toString() + " months",
              status: "Rejected",
            });
          }
        }
        setRejectedLoans(loans);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedLoans();
  }, []);

  const handleRowClick = (row) => {
    navigate(`/loanStatus/${row.loanId}`);
  };

  // Map rejectedLoans into a list of JSX rows with a dark grey background (#222)
  const loanItems = rejectedLoans.map((row) => (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        fontSize: "0.9rem",
        backgroundColor: "#222",
        borderRadius: "4px",
        padding: "8px",
        marginBottom: "8px",
      }}
    >
      <span style={{ width: "10%", fontWeight: "bold" }}>{row.loanId}</span>
      <span style={{ width: "25%" }}>{row.borrower}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.creditScore}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.amount}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.interestRate}</span>
      <span style={{ width: "20%", textAlign: "right" }}>{row.term}</span>
    </span>
  ));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Rejected Loans
      </Typography>
      {loading ? (
        <CustomLoader />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : rejectedLoans.length === 0 ? (
        <Typography>No rejected loans found.</Typography>
      ) : (
        <>
          {/* Header Row */}
          <Box
            sx={{
              backgroundColor: "#181818",
              p: 1,
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
              mb: 2,
            }}
          >
            <Typography sx={{ width: "10%", color: "#28a745", fontWeight: "bold" }}>
              Loan ID
            </Typography>
            <Typography sx={{ width: "25%", color: "#28a745", fontWeight: "bold" }}>
              Borrower
            </Typography>
            <Typography sx={{ width: "15%", color: "#28a745", fontWeight: "bold", textAlign: "right" }}>
              Credit Score
            </Typography>
            <Typography sx={{ width: "15%", color: "#28a745", fontWeight: "bold", textAlign: "right" }}>
              Amount
            </Typography>
            <Typography sx={{ width: "15%", color: "#28a745", fontWeight: "bold", textAlign: "right" }}>
              Interest Rate
            </Typography>
            <Typography sx={{ width: "20%", color: "#28a745", fontWeight: "bold", textAlign: "right" }}>
              Term
            </Typography>
          </Box>
          <AnimatedList
            items={loanItems}
            onItemSelect={(item, index) => handleRowClick(rejectedLoans[index])}
            className="w-full"
            itemClassName=""
          />
        </>
      )}
    </Box>
  );
};

export default RejectedLoans;

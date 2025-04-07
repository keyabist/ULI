import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import CustomTable from "../components/CustomTable";
import CustomLoader from "../components/CustomLoader";
import Sidebar from "../components/Sidebar"; // ✅ Sidebar import

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const ActiveLoans = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("lender"); // Optional: used if Sidebar needs it
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveLoans = async () => {
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

          // Only include active loans for current lender
          if (loan.lender.toLowerCase() === userAddress && loan.status.toString() === "1") {
            const borrowerProfile = await contract.getBorrowerProfile(loan.borrower);
            const username = borrowerProfile.name;
            const creditScore = borrowerProfile.creditScore.toString();

            loans.push({
              loanId: i.toString(),
              borrower: (
                <Link
                  to={`/view-profile/${loan.borrower}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: "#28a745",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  {username}
                </Link>
              ),
              creditScore,
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              term: loan.repaymentPeriod.toString() + " months",
            });
          }
        }

        setActiveLoans(loans);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLoans();
  }, []);

  const handleRowClick = (row) => {
    navigate(`/loanStatus/${row.loanId}`);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#000" }}>
      <Sidebar role={userRole} /> {/* 🧠 Sidebar persistent across dashboard */}
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" sx={{ color: "#39FF14", mb: 3 }}>
          Active Loans
        </Typography>

        {loading ? (
          <CustomLoader />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : activeLoans.length === 0 ? (
          <Typography sx={{ color: "#fff" }}>No active loans found.</Typography>
        ) : (
          <CustomTable
            data={activeLoans}
            columns={[
              { label: "Loan ID", field: "loanId" },
              { label: "Borrower", field: "borrower" },
              { label: "Credit Score", field: "creditScore", align: "right" },
              { label: "Amount", field: "amount", align: "right" },
              { label: "Interest Rate", field: "interestRate", align: "right" },
              { label: "Term", field: "term", align: "right" },
            ]}
            onRowClick={handleRowClick}
          />
        )}
      </Box>
    </Box>
  );
};

export default ActiveLoans;

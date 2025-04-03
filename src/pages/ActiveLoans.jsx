import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert } from "@mui/material";
import { Link } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import CustomTable from "../components/CustomTable";
import CustomLoader from "../components/CustomLoader";
import Navbar from "../components/navbarLender";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const ActiveLoans = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          if (loan.lender.toLowerCase() === userAddress && loan.status.toString() === "1") {
            loans.push({
              loanId: i.toString(),
              borrower: (
                <Link
                  to={`/view-profile/${loan.borrower}`}
                  style={{ color: "#d4af37", textDecoration: "none", fontWeight: "bold" }}
                >
                  {loan.borrower}
                </Link>
              ),
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

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Typography variant="h4" gutterBottom>
        Active Loans
      </Typography>

      {loading ? (
        <CustomLoader />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : activeLoans.length === 0 ? (
        <Typography>No active loans found.</Typography>
      ) : (
          <CustomTable
            data={activeLoans}
            columns={[
              { label: "Loan ID", field: "loanId" },
              { label: "Borrower", field: "borrower" },
              { label: "Amount", field: "amount", align: "right" },
              { label: "Interest Rate", field: "interestRate", align: "right" },
              { label: "Term", field: "term", align: "right" },
            ]}
          />
      )}
    </Box>
  );
};

export default ActiveLoans;

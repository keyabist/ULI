import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert } from "@mui/material";
import { Link } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import CustomTable from "./CustomTable";
import CustomLoader from "./CustomLoader";
import Navbar from "./navbarLender";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const RejectedLoans = () => {
  const [rejectedLoans, setRejectedLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
            loans.push({
              loanId: loan.loanId.toString(),
              borrower: (
                <Link to={`/view-profile/${loan.borrower}`} style={{ color: "#d4af37", textDecoration: "none", fontWeight: "bold" }}>
                  {loan.borrower}
                </Link>
              ),
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

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
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
        <CustomTable
          data={rejectedLoans}
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

export default RejectedLoans;

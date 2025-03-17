import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ethers } from "ethers";
import { contractConfig } from "../contractConfig";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbarLender";

const PendingRequests = () => {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null); // Track loading per loan
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingLoans = async () => {
      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = (await signer.getAddress()).toLowerCase();
        const contract = new ethers.Contract(
          contractConfig.contractAddress,
          contractConfig.abi,
          signer
        );

        const nextLoanIdBN = await contract.nextLoanId();
        const nextLoanId = Number(nextLoanIdBN);

        const tempPending = [];

        for (let loanId = 1; loanId < nextLoanId; loanId++) {
          const loan = await contract.loans(loanId);
          if (
            loan.lender.toLowerCase() === userAddress &&
            Number(loan.status) === 0
          ) {
            tempPending.push({
              loanId: loan.loanId.toString(),
              borrower: loan.borrower,
              amount: ethers.formatUnits(loan.amount, "ether") + " ETH",
              interestRate: loan.interestRate.toString() + " %",
              term: loan.repaymentPeriod.toString() + " months",
              status: "Pending",
            });
          }
        }
        setPendingLoans(tempPending);
      } catch (err) {
        console.error("Error fetching pending loans:", err);
        setError("Error fetching pending loans.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingLoans();
  }, []);

  const handleApproveRedirect = (loan) => {
    navigate("/transactionPage", { state: { loan } });
  };

  const handleRejectLoan = async (loanId) => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask to proceed.");
        return;
      }

      setProcessing(loanId); // Show loading state for the loan being rejected

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractConfig.contractAddress,
        contractConfig.abi,
        signer
      );

      const tx = await contract.rejectLoan(loanId);
      await tx.wait(); // Wait for transaction confirmation

      alert(`Loan ${loanId} has been rejected successfully.`);

      // Update the UI after rejection
      setPendingLoans((prevLoans) =>
        prevLoans.filter((loan) => loan.loanId !== loanId)
      );
    } catch (error) {
      console.error("Error rejecting loan:", error);
      alert("Failed to reject the loan.");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Typography variant="h4" gutterBottom>
        Pending Loan Requests
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && pendingLoans.length === 0 && (
        <Typography>No pending loan requests found.</Typography>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Borrower</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Interest Rate</TableCell>
              <TableCell align="right">Term</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingLoans.map((loan) => (
              <TableRow key={loan.loanId}>
                <TableCell>{loan.borrower}</TableCell>
                <TableCell align="right">{loan.amount}</TableCell>
                <TableCell align="right">{loan.interestRate}</TableCell>
                <TableCell align="right">{loan.term}</TableCell>
                <TableCell align="right">
                  <Chip label={loan.status} color="warning" size="small" />
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApproveRedirect(loan)}
                    disabled={processing === loan.loanId}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleRejectLoan(loan.loanId)}
                    disabled={processing === loan.loanId}
                    sx={{ ml: 1 }}
                  >
                    {processing === loan.loanId ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Reject"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PendingRequests;

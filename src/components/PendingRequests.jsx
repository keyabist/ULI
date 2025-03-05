import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { ethers } from 'ethers';
import { contractConfig } from '../contractConfig';

const PendingRequests = () => {
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch pending loans on mount
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

        // Get the next loan ID (loans are stored from 1 to nextLoanId - 1)
        const nextLoanIdBN = await contract.nextLoanId();
        const nextLoanId = Number(nextLoanIdBN); // Use Number() conversion

        const tempPending = [];

        // Iterate over all loan IDs
        for (let loanId = 1; loanId < nextLoanId; loanId++) {
          const loan = await contract.loans(loanId);
          // Check if the loan belongs to the connected lender and is Pending (status 0)
          if (
            loan.lender.toLowerCase() === userAddress &&
            Number(loan.status) === 0
          ) {
            tempPending.push({
              loanId: loan.loanId.toString(),
              borrower: loan.borrower,
              amount: ethers.formatUnits(loan.amount, 'ether') + " ETH",
              interestRate: loan.interestRate.toString() + " %",
              term: loan.repaymentPeriod.toString() + " months",
              collateral: "N/A", // Not stored on-chain
              requestDate: "N/A",  // Not stored on-chain
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

  // Approve a pending loan by calling the contract's approveLoan(loanId)
  const handleApprove = async (loanId) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractConfig.contractAddress, contractConfig.abi, signer);
      const tx = await contract.approveLoan(loanId);
      await tx.wait();
      alert(`Loan ${loanId} approved successfully!`);
      // Refresh the list after approval
      setPendingLoans(pendingLoans.filter((loan) => loan.loanId !== loanId.toString()));
    } catch (err) {
      console.error("Error approving loan:", err);
      alert("Failed to approve loan. Check console for details.");
    }
  };

  // Since rejection is not implemented in your contract, this is just a stub.
  const handleReject = async (loanId) => {
    alert("Reject function is not implemented in the contract.");
  };

  return (
    <Box sx={{ p: 2 }}>
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
              <TableCell align="right">Collateral</TableCell>
              <TableCell align="right">Request Date</TableCell>
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
                <TableCell align="right">{loan.collateral}</TableCell>
                <TableCell align="right">{loan.requestDate}</TableCell>
                <TableCell align="right">
                  <Chip label={loan.status} color="warning" size="small" />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(loan.loanId)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(loan.loanId)}
                    >
                      Reject
                    </Button>
                  </Box>
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

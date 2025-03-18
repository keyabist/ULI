import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { ethers } from 'ethers';
import Navbar from './navbarLender';
import { contractConfig } from '../contractConfig';

const LenderDashboard = () => {
  const [stats, setStats] = useState({
    totalActiveLoans: 0,
    totalPendingRequests: 0,
    totalLentAmount: '0 ETH',
    totalPendingAmount: '0 ETH',
  });

  const [activeLoans, setActiveLoans] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchLoansForLender = async () => {
      if (!window.ethereum) {
        console.error('MetaMask is not installed.');
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress(); // Currently connected lender
        const contract = new ethers.Contract(
          contractConfig.contractAddress,
          contractConfig.abi,
          signer
        );

        // Get the total number of loans created so far
        const totalLoansBN = await contract.nextLoanId(); // Native BigInt now
        const totalLoans = Number(totalLoansBN); // Convert BigInt to Number

        const tempActive = [];
        const tempPending = [];

        // Enumerate all loans from ID 1 to nextLoanId - 1
        for (let loanId = 1; loanId < totalLoans; loanId++) {
          const loan = await contract.loans(loanId);
          // Compare addresses in lowercase
          if (loan.lender.toLowerCase() === userAddress.toLowerCase()) {
            const status = Number(loan.status); // Convert BigInt status to number
            if (status === 0) {
              tempPending.push(loan);
            } else if (status === 1) {
              tempActive.push(loan);
            }
          }
        }

        // Sum amounts for each category
        const sumPending = tempPending.reduce((acc, loan) => {
          return acc + parseFloat(ethers.formatUnits(loan.amount, 'ether'));
        }, 0);

        const sumActive = tempActive.reduce((acc, loan) => {
          return acc + parseFloat(ethers.formatUnits(loan.amount, 'ether'));
        }, 0);

        setPendingRequests(tempPending);
        setActiveLoans(tempActive);

        setStats({
          totalActiveLoans: tempActive.length,
          totalPendingRequests: tempPending.length,
          totalLentAmount: `${sumActive} ETH`,
          totalPendingAmount: `${sumPending} ETH`,
        });
      } catch (err) {
        console.error('Error fetching lender loans:', err);
      }
    };

    fetchLoansForLender();
  }, []);

  return (
    <Box>
      <Navbar />
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Active Loans Card */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 250,
              cursor: 'pointer',
            }}
            component={Link}
            to="/activeLoans"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalanceIcon sx={{ mr: 1, fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h6">Active Loans</Typography>
            </Box>
            <Typography variant="h3" gutterBottom>
              {stats.totalActiveLoans}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Total Amount: {stats.totalLentAmount}
            </Typography>
          </Paper>
        </Grid>

        {/* Pending Requests Card */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 250,
              cursor: 'pointer',
            }}
            component={Link}
            to="/pendingRequests"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PendingActionsIcon sx={{ mr: 1, fontSize: 40, color: 'secondary.main' }} />
              <Typography variant="h6">Pending Requests</Typography>
            </Box>
            <Typography variant="h3" gutterBottom>
              {stats.totalPendingRequests}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Total Amount: {stats.totalPendingAmount}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LenderDashboard;

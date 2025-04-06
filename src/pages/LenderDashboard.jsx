import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ethers } from 'ethers';
import { contractConfig } from '../contractConfig';
import "../App.css";

const LenderDashboard = () => {
  const [stats, setStats] = useState({
    totalActiveLoans: 0,
    totalPendingRequests: 0,
    totalLentAmount: '0 ETH',
    totalPendingAmount: '0 ETH',
    totalLendingVolume: '0 ETH', // Recommended Stat: Total Lending Volume
    averageInterestRate: '0%',   // Recommended Stat: Average Interest Rate
    topLender: 'N/A',            // Recommended Stat: Top Lender (or Top Borrower)
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
        const userAddress = await signer.getAddress();
        const contract = new ethers.Contract(
          contractConfig.contractAddress,
          contractConfig.abi,
          signer
        );

        const totalLoansBN = await contract.nextLoanId();
        const totalLoans = Number(totalLoansBN);

        const tempActive = [];
        const tempPending = [];
        let lendingVolume = 0;
        let interestTotal = 0;
        let interestCount = 0;

        for (let loanId = 1; loanId < totalLoans; loanId++) {
          const loan = await contract.loans(loanId);
          if (loan.lender.toLowerCase() === userAddress.toLowerCase()) {
            const status = Number(loan.status);
            const amount = parseFloat(ethers.formatUnits(loan.amount, 'ether'));
            lendingVolume += amount;
            if (loan.interestRate) {
              interestTotal += Number(loan.interestRate);
              interestCount++;
            }
            if (status === 0) {
              tempPending.push(loan);
            } else if (status === 1) {
              tempActive.push(loan);
            }
          }
        }

        const avgInterest =
          interestCount > 0 ? (interestTotal / interestCount).toFixed(2) : '0';

        setPendingRequests(tempPending);
        setActiveLoans(tempActive);
        setStats({
          totalActiveLoans: tempActive.length,
          totalPendingRequests: tempPending.length,
          totalLentAmount: `${lendingVolume} ETH`,
          totalPendingAmount: `${tempPending.reduce((acc, loan) => {
            return acc + parseFloat(ethers.formatUnits(loan.amount, 'ether'));
          }, 0)} ETH`,
          totalLendingVolume: `${lendingVolume} ETH`,
          averageInterestRate: `${avgInterest}%`,
          topLender: userAddress.slice(0, 6) + '...' + userAddress.slice(-4),
        });
      } catch (err) {
        console.error('Error fetching lender loans:', err);
      }
    };

    fetchLoansForLender();
  }, []);

  // Overview boxes for the non-clickable section
  const overviewBoxes = [
    {
      title: "Lending Volume",
      value: stats.totalLendingVolume,
      description: "ETH Lent",
    },
    {
      title: "Avg. Rate",
      value: stats.averageInterestRate,
      description: "Across Loans",
    },
    {
      title: "Top Lender",
      value: stats.topLender,
      description: "Your ID",
    },
  ];

  return (
    <Box sx={{ backgroundColor: '#000', minHeight: '100vh' }}>
      <Box sx={{ p: 3, mt: { xs: 2, md: 2 }}}>
        {/* Heading & Description */}
        <Box sx={{ mb: 3, textAlign: 'left', minHeight: 100}}>
          <Typography variant="h4" sx={{ color: '#39FF14' }}>
            Unified Lending Interface
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#fff', mt: 1 }}>
            A comprehensive overview of your loan portfolio and performance metrics.
          </Typography>
        </Box>

        {/* Row: Non-Clickable Boxes (Overview) and Stats Panel */}
        <Grid container spacing={2} alignItems="flex-start">
          {/* Non-Clickable Overview Boxes */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {overviewBoxes.map((box, idx) => (
                <Grid item xs={12} sm={4} key={idx}>
                  <Paper
                    sx={{
                      p: 1,
                      backgroundColor: '#222',
                      color: '#fff',
                      textAlign: 'center',
                    }}
                    elevation={3}
                  >
                    <Typography variant="caption" sx={{ color: '#39FF14' }}>
                      {box.title}
                    </Typography>
                    <Typography variant="h6">{box.value}</Typography>
                    <Typography variant="caption">{box.description}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Additional Stats Panel */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#222',
                color: '#fff',
              }}
              elevation={3}
            >
              <Typography variant="h6" gutterBottom>
                Additional Statistics
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption">Total Lending Volume</Typography>
                <Typography variant="subtitle1">{stats.totalLendingVolume}</Typography>
              </Box>
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption">Average Interest Rate</Typography>
                <Typography variant="subtitle1">{stats.averageInterestRate}</Typography>
              </Box>
              <Box>
                <Typography variant="caption">Top Lender</Typography>
                <Typography variant="subtitle1">{stats.topLender}</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Spacing */}
        <Box sx={{ mt: 4 }} />

        {/* Row: Clickable Boxes */}
        <Grid container spacing={3}>
          {/* Active Loans */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: '#222',
                color: '#fff',
                height: 130,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
              component={Link}
              to="/activeLoans"
              elevation={3}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon sx={{ mr: 1, fontSize: 30, color: '#39FF14' }} />
                <Typography variant="subtitle1">Active</Typography>
              </Box>
              <Typography variant="h5">{stats.totalActiveLoans}</Typography>
              <Typography variant="caption" sx={{ mt: 'auto' }}>
                {stats.totalLentAmount}
              </Typography>
            </Paper>
          </Grid>

          {/* Pending Requests */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: '#222',
                color: '#fff',
                height: 130,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
              component={Link}
              to="/pendingRequests"
              elevation={3}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingActionsIcon sx={{ mr: 1, fontSize: 30, color: '#39FF14' }} />
                <Typography variant="subtitle1">Pending</Typography>
              </Box>
              <Typography variant="h5">{stats.totalPendingRequests}</Typography>
              <Typography variant="caption" sx={{ mt: 'auto' }}>
                {stats.totalPendingAmount}
              </Typography>
            </Paper>
          </Grid>

          {/* Rejected Loans */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: '#222',
                color: '#fff',
                height: 130,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
              component={Link}
              to="/rejectedLoans"
              elevation={3}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CancelIcon sx={{ mr: 1, fontSize: 30, color: '#f44336' }} />
                <Typography variant="subtitle1">Rejected</Typography>
              </Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="caption" sx={{ mt: 'auto' }}>
                0 ETH
              </Typography>
            </Paper>
          </Grid>

          {/* Completed Loans */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                backgroundColor: '#222',
                color: '#fff',
                height: 130,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}
              component={Link}
              to="/completedLoans"
              elevation={3}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon sx={{ mr: 1, fontSize: 30, color: '#4caf50' }} />
                <Typography variant="subtitle1">Completed</Typography>
              </Box>
              <Typography variant="h5">0</Typography>
              <Typography variant="caption" sx={{ mt: 'auto' }}>
                0 ETH
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LenderDashboard;

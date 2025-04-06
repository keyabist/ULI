import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { contractConfig } from '../contractConfig';

const Intro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalLoans, setTotalLoans] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [borrowerBoard, setBorrowerBoard] = useState([]);
  const [lenderBoard, setLenderBoard] = useState([]);
  const [userType, setUserType] = useState(null);

  // Check if user is registered as borrower or lender
  useEffect(() => {
    const checkUserType = async () => {
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

        // Check if user is registered as borrower
        try {
          const borrowerProfile = await contract.getBorrowerProfile(userAddress);
          if (borrowerProfile.isRegistered) {
            setUserType('borrower');
            return;
          }
        } catch (error) {
          // Not registered as borrower
        }

        // Check if user is registered as lender
        try {
          const lenderProfile = await contract.getLenderProfile(userAddress);
          if (lenderProfile.isRegistered) {
            setUserType('lender');
            return;
          }
        } catch (error) {
          // Not registered as lender
        }

        setUserType(null);
      } catch (err) {
        console.error('Error checking user type:', err);
      }
    };

    checkUserType();
  }, []);

  // Fetch data from the smart contract
  useEffect(() => {
    const fetchData = async () => {
      if (!window.ethereum) {
        console.error('MetaMask is not installed.');
        setLoading(false);
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractConfig.contractAddress,
          contractConfig.abi,
          signer
        );

        // Fetch all borrowers and lenders
        const borrowers = await contract.getAllBorrowers();
        const lenders = await contract.getAllLenders();
        setTotalUsers(borrowers.length + lenders.length);

        // Loan count calculation
        const nextLoanIdBN = await contract.nextLoanId();
        const loanCount = nextLoanIdBN > 0 ? Number(nextLoanIdBN) - 1 : 0;
        setTotalLoans(loanCount);

        // Active loans calculation
        let activeCount = 0;
        for (let i = 1; i <= loanCount; i++) {
          try {
            const loan = await contract.loans(i);
            const status = Number(loan.status);
            if (status === 1) {
              // 1 = Approved
              activeCount++;
            }
          } catch (error) {
            console.error(`Error fetching loan ${i}:`, error);
          }
        }
        setActiveLoans(activeCount);

        // Borrower leaderboard
        const borrowerProfiles = await Promise.all(
          borrowers.map(async (addr) => {
            try {
              const profile = await contract.getBorrowerProfile(addr);
              return {
                address: addr,
                name: profile.name,
                creditScore: Number(profile.creditScore),
              };
            } catch (error) {
              console.error('Error fetching borrower profile:', error);
              return null;
            }
          })
        );

        // Lender leaderboard
        const lenderProfiles = await Promise.all(
          lenders.map(async (addr) => {
            try {
              const profile = await contract.getLenderProfile(addr);
              return {
                address: addr,
                name: profile.name,
                creditScore: Number(profile.creditScore),
              };
            } catch (error) {
              console.error('Error fetching lender profile:', error);
              return null;
            }
          })
        );

        // Filter out null results and sort
        const validBorrowers = borrowerProfiles.filter((profile) => profile !== null);
        const validLenders = lenderProfiles.filter((profile) => profile !== null);

        const sortedBorrowers = validBorrowers
          .sort((a, b) => b.creditScore - a.creditScore)
          .slice(0, 5);
        const sortedLenders = validLenders
          .sort((a, b) => b.creditScore - a.creditScore)
          .slice(0, 5);

        setBorrowerBoard(sortedBorrowers);
        setLenderBoard(sortedLenders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navigation handlers
  const handleDashboardClick = () => {
    if (userType === 'borrower') {
      navigate('/borrowerDashboard');
    } else if (userType === 'lender') {
      navigate('/lenderDashboard');
    } else {
      navigate('/register'); // Redirect to registration if not registered
    }
  };

  const handleFundManagementClick = () => {
    navigate('/fundManagement');
  };

  const handleDisconnectWallet = () => {
    // Add your disconnect wallet logic here
    console.log('Wallet disconnected');
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress sx={{ color: '#39FF14' }} />
        </Box>
      ) : (
        <>
          {/* Platform Stats */}
          <Typography variant="h4" sx={{ color: '#39FF14', mb: 3 }}>
            Platform Overview
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{
                p: 3,
                backgroundColor: '#111',
                color: '#fff',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ color: '#39FF14' }}>Total Users</Typography>
                <Typography variant="h4">{totalUsers}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{
                p: 3,
                backgroundColor: '#111',
                color: '#fff',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ color: '#39FF14' }}>Total Loans</Typography>
                <Typography variant="h4">{totalLoans}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{
                p: 3,
                backgroundColor: '#111',
                color: '#fff',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ color: '#39FF14' }}>Active Loans</Typography>
                <Typography variant="h4">{activeLoans}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Leaderboards */}
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, backgroundColor: '#111' }}>
                <Typography variant="h6" sx={{ color: '#39FF14', mb: 2 }}>
                  Top Borrowers
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Credit Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {borrowerBoard.map((borrower, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: '#fff' }}>{borrower.name}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{borrower.creditScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, backgroundColor: '#111' }}>
                <Typography variant="h6" sx={{ color: '#39FF14', mb: 2 }}>
                  Top Lenders
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                      <TableCell sx={{ color: '#fff' }}>Credit Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lenderBoard.map((lender, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: '#fff' }}>{lender.name}</TableCell>
                        <TableCell sx={{ color: '#fff' }}>{lender.creditScore}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Intro;

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
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider
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
import Sidebar from '../components/Siderbar';

const drawerWidth = 240;

const Intro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalLoans, setTotalLoans] = useState(0);
  const [activeLoans, setActiveLoans] = useState(0);
  const [borrowerBoard, setBorrowerBoard] = useState([]);
  const [lenderBoard, setLenderBoard] = useState([]);
  const [userType, setUserType] = useState(null); // 'borrower', 'lender', or null

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
      navigate('/splashScreen'); // Redirect to registration if not registered
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
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000', color: '#fff' }}>
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
        {/* Blockchain Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LinkIcon sx={{ color: '#39FF14' }} />
          <Typography variant="body2" sx={{ color: '#39FF14', fontWeight: 500 }}>
            Blockchain Powered Lending
          </Typography>
        </Box>

        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#39FF14', fontWeight: 'bold', mb: 1 }}>
            ULI : <span style={{ fontWeight: 300, color: '#fff' }}>Transparency &amp; Trust</span>
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 3, maxWidth: 800 }}>
            A decentralized platform that revolutionizes lending through transparent transactions and accountable
            fund management on the blockchain. ULI leverages decentralized identity for secured loan transactions with smart contracts
            automating disbursement and repayment schedules.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleDashboardClick}
              sx={{
                backgroundColor: '#39FF14',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#2ecc71' },
                px: 3,
                py: 1,
                borderRadius: 2,
              }}
            >
              Dashboard
            </Button>
          </Box>
        </Box>

        {/* Public Treasury / Dynamic Stats Section */}
        <Paper sx={{ p: 3, backgroundColor: '#111', mb: 4 }} elevation={3}>
          <Typography variant="h6" sx={{ color: '#39FF14', mb: 2 }}>
            Overall Stats
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: '#000', textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: '#39FF14', fontWeight: 'bold' }}>
                  Total Users
                </Typography>
                {loading ? (
                  <CircularProgress size={40} sx={{ color: '#39FF14', mt: 2 }} />
                ) : (
                  <Typography variant="h4" sx={{ color: '#fff', mt: 1 }}>
                    {totalUsers}
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: '#000', textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: '#39FF14', fontWeight: 'bold' }}>
                  Total Loans
                </Typography>
                {loading ? (
                  <CircularProgress size={40} sx={{ color: '#39FF14', mt: 2 }} />
                ) : (
                  <Typography variant="h4" sx={{ color: '#fff', mt: 1 }}>
                    {totalLoans}
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: '#000', textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: '#39FF14', fontWeight: 'bold' }}>
                  Active Loans
                </Typography>
                {loading ? (
                  <CircularProgress size={40} sx={{ color: '#39FF14', mt: 2 }} />
                ) : (
                  <Typography variant="h4" sx={{ color: '#fff', mt: 1 }}>
                    {activeLoans}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* Leadership Boards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#39FF14', mb: 2 }}>
            Leadership Boards
          </Typography>
          <Grid container spacing={4}>
            {/* Top Borrowers */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, backgroundColor: '#111' }} elevation={3}>
                <Typography variant="h6" sx={{ color: '#39FF14', mb: 3 }}>
                  Top Borrowers
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: '#39FF14' }} />
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#39FF14', fontWeight: 'bold' }}>Rank</TableCell>
                        <TableCell sx={{ color: '#39FF14', fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell align="right" sx={{ color: '#39FF14', fontWeight: 'bold' }}>Credit Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {borrowerBoard.length > 0 ? (
                        borrowerBoard.map((borrower, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ color: '#fff' }}>{index + 1}</TableCell>
                            <TableCell sx={{ color: '#fff' }}>{borrower.name || 'Anonymous'}</TableCell>
                            <TableCell align="right" sx={{ color: '#fff' }}>
                              {borrower.creditScore}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#999' }}>
                            No borrowers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Grid>

            {/* Top Lenders */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, backgroundColor: '#111' }} elevation={3}>
                <Typography variant="h6" sx={{ color: '#39FF14', mb: 3 }}>
                  Top Lenders
                </Typography>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress sx={{ color: '#39FF14' }} />
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#39FF14', fontWeight: 'bold' }}>Rank</TableCell>
                        <TableCell sx={{ color: '#39FF14', fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell align="right" sx={{ color: '#39FF14', fontWeight: 'bold' }}>Credit Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lenderBoard.length > 0 ? (
                        lenderBoard.map((lender, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ color: '#fff' }}>{index + 1}</TableCell>
                            <TableCell sx={{ color: '#fff' }}>{lender.name || 'Anonymous'}</TableCell>
                            <TableCell align="right" sx={{ color: '#fff' }}>
                              {lender.creditScore}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#999' }}>
                            No lenders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Feature Sections */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#39FF14', mb: 2 }}>
            Platform Features
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, backgroundColor: '#111' }} elevation={3}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <DashboardIcon sx={{ color: '#39FF14' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#39FF14', mb: 1 }}>
                  Decentralized Lending
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  Direct peer-to-peer loans without intermediaries. Secure, transparent, and efficient transactions using blockchain technology.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, backgroundColor: '#111' }} elevation={3}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <AnalyticsIcon sx={{ color: '#39FF14' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#39FF14', mb: 1 }}>
                  ML-Powered Verification
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  Advanced machine learning models to verify documents and streamline the loan process, increasing transparency and accessibility.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 3, backgroundColor: '#111' }} elevation={3}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    backgroundColor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ color: '#39FF14' }} />
                </Box>
                <Typography variant="h6" sx={{ color: '#39FF14', mb: 1 }}>
                  Smart Contracts
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                  Automated loan agreements with predefined terms and conditions that execute without human intervention, secured by blockchain.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Disconnect Wallet Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleDisconnectWallet}
          sx={{
            backgroundColor: '#ef4444',
            color: '#fff',
            fontWeight: 'bold',
            py: 1.5,
            borderRadius: 2,
            '&:hover': { backgroundColor: '#dc2626' }
          }}
        >
          <AccountBalanceWalletIcon sx={{ mr: 1 }} />
          Disconnect Wallet
        </Button>
      </Box>
    </Box>
  );
};

export default Intro;
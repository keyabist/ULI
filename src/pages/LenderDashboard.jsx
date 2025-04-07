import React, { useEffect, useState } from 'react';
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { Link } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ethers } from 'ethers';
import Navbar from '../components/navbarLender';
import { contractConfig } from '../contractConfig';
import '../App.css';
import './LenderDashboard.css';
import LoanBox from '../components/CustomClickableBox';
import ClickableLoanBox from '../components/CustomClickableBox';

const LenderDashboard = () => {
  const [stats, setStats] = useState({
    totalActiveLoans: 0,
    totalPendingRequests: 0,
    totalLentAmount: '0 ETH',
    totalPendingAmount: '0 ETH',
    totalLendingVolume: '0 ETH',
    averageInterestRate: '0%',
    topLender: 'N/A',
  });

  const [activeLoans, setActiveLoans] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // For Borrowers Leaderboard
  const [borrowerBoard, setBorrowerBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch loans for this lender and compute stats
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

  // Fetch and build the Borrowers Leaderboard
  useEffect(() => {
    const fetchBorrowers = async () => {
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

        const borrowers = await contract.getAllBorrowers();
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

        const validBorrowers = borrowerProfiles.filter((profile) => profile !== null);
        const sortedBorrowers = validBorrowers
          .sort((a, b) => b.creditScore - a.creditScore)
          .slice(0, 5);

        setBorrowerBoard(sortedBorrowers);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching borrower data:', err);
        setLoading(false);
      }
    };

    fetchBorrowers();
  }, []);

  // Overview boxes for non-clickable section
  const overviewBoxes = [
    {
      title: 'Lending Volume',
      value: stats.totalLendingVolume,
      description: 'ETH Lent',
    },
    {
      title: 'Avg. Rate',
      value: stats.averageInterestRate,
      description: 'Across Loans',
    },
    {
      title: 'Top Lender',
      value: stats.topLender,
      description: 'Your ID',
    },
  ];

  return (
    <div className="lender-dashboard">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Heading & Description */}
        <div className="heading">
          <Typography variant="h4">
            Welcome to Lenders Dashboard
          </Typography>
          <Typography variant="subtitle1">
            A comprehensive overview of your loan portfolio and performance metrics.
          </Typography>
        </div>

        {/* Row: Overview Boxes and Leaderboard Panel */}
        <Grid container spacing={2}>
          {/* Overview Boxes */}
          <Grid item xs={12} md={8}>
            <div className="overview-container">
              {overviewBoxes.map((box, idx) => (
                <div className="overview-box" key={idx}>
                  <Typography className="title" variant="caption">
                    {box.title}
                  </Typography>
                  <Typography className="value" variant="h6">
                    {box.value}
                  </Typography>
                  <Typography className="description" variant="caption">
                    {box.description}
                  </Typography>
                </div>
              ))}
            </div>
          </Grid>

          {/* Leaderboard Box - same style as overview boxes */}
          <Grid item xs={12} md={4}>
            <div className="overview-box" style={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom style={{ color: '#39FF14' }}>
                Top Borrowers
              </Typography>
              <Box sx={{ maxHeight: '250px', overflowY: 'auto' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress sx={{ color: '#39FF14' }} />
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#39FF14', fontWeight: 'bold' }}>Rank</TableCell>
                        <TableCell sx={{ color: '#39FF14', fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell align="right" sx={{ color: '#39FF14', fontWeight: 'bold' }}>
                          Credit Score
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {borrowerBoard.length > 0 ? (
                        borrowerBoard.map((borrower, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ color: '#ccc' }}>{index + 1}</TableCell>
                            <TableCell sx={{ color: '#ccc' }}>
                              {borrower.name || 'Anonymous'}
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#ccc' }}>
                              {borrower.creditScore}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} sx={{ textAlign: 'center', color: '#666' }}>
                            No borrowers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </Box>
            </div>
          </Grid>
        </Grid>

        {/* Spacing */}
        <div className="spacing" />

        {/* Row: Clickable Boxes */}
        {/* Row: Clickable Boxes */}
        <Grid container spacing={3}>
          {/* Active Loans */}
          <Grid item xs={12} sm={6} md={3}>
            <ClickableLoanBox
              icon={<AccountBalanceIcon className="icon" />}
              title="Active"
              value={stats.totalActiveLoans}
              caption={stats.totalLentAmount}
              link="/activeLoans"
            />
          </Grid>

          {/* Pending Requests */}
          <Grid item xs={12} sm={6} md={3}>
            <ClickableLoanBox
              icon={<PendingActionsIcon className="icon" />}
              title="Pending"
              value={stats.totalPendingRequests}
              caption={stats.totalPendingAmount}
              link="/pendingRequests"
            />
          </Grid>

          {/* Rejected Loans */}
          <Grid item xs={12} sm={6} md={3}>
            <ClickableLoanBox
              icon={<CancelIcon className="icon" />}
              title="Rejected"
              value="0"
              caption="0 ETH"
              link="/rejectedLoans"
            />
          </Grid>

          {/* Completed Loans */}
          <Grid item xs={12} sm={6} md={3}>
            <ClickableLoanBox
              icon={<CheckCircleIcon className="icon" />}
              title="Completed"
              value="0"
              caption="0 ETH"
              link="/completedLoans"
            />
          </Grid>
        </Grid>


      </div>
    </div>
  );
};

export default LenderDashboard;

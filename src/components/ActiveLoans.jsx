import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractConfig } from '../contractConfig';
import { Typography, Paper, List, ListItem } from '@mui/material';

const ActiveLoans = () => {
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchActiveLoans = async () => {
      if (!window.ethereum) {
        console.error('MetaMask not installed');
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

        const totalLoansBN = await contract.nextLoanId();
        const totalLoans = Number(totalLoansBN); // Convert BigInt to number

        const tempActive = [];

        for (let loanId = 1; loanId < totalLoans; loanId++) {
          const loan = await contract.loans(loanId);
          if (
            loan.lender.toLowerCase() === userAddress &&
            Number(loan.status) === 1
          ) {
            tempActive.push({
              loanId: loan.loanId.toString(),
              borrower: loan.borrower,
              amount: ethers.formatUnits(loan.amount, 'ether') + " ETH",
              repaymentPeriod: Number(loan.repaymentPeriod) + " months",
            });
          }
        }
        setActiveLoans(tempActive);
      } catch (err) {
        console.error('Error fetching active loans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveLoans();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Active Loans
      </Typography>
      {loading && <p>Loading active loans...</p>}
      <List>
        {activeLoans.map((loan, idx) => (
          <Paper key={idx} sx={{ mb: 2, p: 2 }}>
            <ListItem>
              <div>
                <Typography variant="body1">
                  Loan ID: {loan.loanId}
                </Typography>
                <Typography variant="body1">
                  Borrower: {loan.borrower}
                </Typography>
                <Typography variant="body1">
                  Amount: {loan.amount}
                </Typography>
                <Typography variant="body1">
                  Repayment Period: {loan.repaymentPeriod}
                </Typography>
              </div>
            </ListItem>
          </Paper>
        ))}
      </List>
      {activeLoans.length === 0 && !loading && (
        <Typography>No active loans found.</Typography>
      )}
    </div>
  );
};

export default ActiveLoans;

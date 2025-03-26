import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import contractABI from "../contracts/abi.json";
import Navbar from "./navbarLender";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const RejectedLoansPage = () => {
  const [rejectedLoans, setRejectedLoans] = useState([]);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.ethereum) {
      setError("MetaMask is not installed.");
      return;
    }
    const p = new ethers.BrowserProvider(window.ethereum);
    setProvider(p);
    p.getSigner()
      .then((s) => {
        setSigner(s);
        const c = new ethers.Contract(CONTRACT_ADDRESS, contractABI, s);
        setContract(c);
      })
      .catch((error) => {
        console.error("Error getting signer:", error);
        setError("Error getting signer. Please check your MetaMask configuration.");
      });
  }, []);

  useEffect(() => {
    const fetchRejectedLoans = async () => {
      if (contract && signer) {
        try {
          setLoading(true);
          const userAddress = (await signer.getAddress()).toLowerCase();
          const loanCount = await contract.nextLoanId();

          const loans = [];
          for(let i=1; i< loanCount; i++){
            const loan = await contract.loans(i);
            const status = await loan.status.toString();

            if(loan.lender.toLowerCase() === userAddress && status === "2"){
              loans.push({
                loanId: loan.loanId.toString(),
                amount: ethers.formatUnits(loan.amount, 18) + " ETH",
                interestRate: loan.interestRate.toString() + "%",
                repaymentPeriod: loan.repaymentPeriod.toString() + " months",
                status: status,
                borrower: loan.borrower,
              });
            } 
          }
          setRejectedLoans(loans);
          setError(""); 
        } catch (error) {
          console.error("Error fetching rejected loans:", error);
          setError("Error fetching rejected loans.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRejectedLoans();
  }, [contract, signer]);

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Typography variant="h4" gutterBottom>
        Rejected Loans
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && rejectedLoans.length === 0 ? (
        <Typography>No rejected loans found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loan ID</TableCell>
                <TableCell>Borrower</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Interest Rate</TableCell>
                <TableCell align="right">Term</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rejectedLoans.map((loan) => (
                <TableRow key={loan.loanId}>
                  <TableCell>{loan.loanId}</TableCell>
                  <TableCell>{loan.borrower}</TableCell>
                  <TableCell align="right">{loan.amount}</TableCell>
                  <TableCell align="right">{loan.interestRate}</TableCell>
                  <TableCell align="right">{loan.repaymentPeriod}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={
                        loan.status === "0"
                          ? "Pending"
                          : loan.status === "1"
                          ? "Approved"
                          : loan.status === "2"
                          ? "Rejected"
                          : loan.status === "3"
                          ? "Completed"
                          : "Unknown"
                      }
                      color={
                        loan.status === "0"
                          ? "warning"
                          : loan.status === "1"
                          ? "info"
                          : loan.status === "2"
                          ? "error"
                          : loan.status === "3"
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
  
};

export default RejectedLoansPage;

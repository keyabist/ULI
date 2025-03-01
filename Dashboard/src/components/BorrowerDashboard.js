import React, { useEffect, useState } from "react";
import { 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  Button, 
  TextField, 
  Box, 
  CircularProgress, 
  Alert 
} from "@mui/material";
import { ethers } from "ethers";
import { contractConfig } from "../contractConfig";

const BorrowerDashboard = () => {
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestingLender, setRequestingLender] = useState(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const fetchLenders = async () => {
      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractConfig.contractAddress, contractConfig.abi, signer);

        const lenderData = await contract.getAllLenders();

        const formattedLenders = lenderData.map((lender, index) => ({
          id: index + 1,
          address: lender.lenderAddress,
          name: lender.name,
          phone: lender.phone,
          email: lender.email,
        }));

        setLenders(formattedLenders);
      } catch (error) {
        setError("Error fetching lender data.");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLenders();
  }, []);

  const handleRequestClick = (lenderAddress) => {
    setRequestingLender(lenderAddress);
    setAmount("");
  };

  const handleConfirmRequest = async () => {
    if (!amount) return;

    try {
      // Call your smart contract function here to create a loan request
      console.log(`Requesting ${amount} from lender: ${requestingLender}`);
      
      // Close input field after confirming
      setRequestingLender(null);
      setAmount("");
    } catch (error) {
      console.error("Loan request error:", error);
    }
  };

  return (
    <Paper sx={{ maxWidth: 600, margin: "auto", mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Borrower Dashboard
      </Typography>

      <Typography variant="h6" gutterBottom>
        Available Lenders
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <List>
        {lenders.length > 0 ? (
          lenders.map((lender) => (
            <ListItem key={lender.id} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <ListItemText 
                primary={lender.name} 
                secondary={
                  <>
                    <Typography variant="body2">📧 Email: {lender.email}</Typography>
                    <Typography variant="body2">📞 Phone: {lender.phone}</Typography>
                    <Typography variant="body2">🏦 Address: {lender.lenderAddress}</Typography>
                  </>
                }
              />

              {requestingLender === lender.address ? (
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <TextField
                    size="small"
                    label="Enter Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <Button variant="contained" color="success" onClick={handleConfirmRequest}>
                    Confirm
                  </Button>
                </Box>
              ) : (
                <Button variant="outlined" onClick={() => handleRequestClick(lender.address)}>
                  Request
                </Button>
              )}
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">No lenders available.</Typography>
        )}
      </List>
    </Paper>
  );
};

export default BorrowerDashboard;

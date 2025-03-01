import React, { useEffect, useState } from "react";
import { Typography, List, ListItem, ListItemText, Paper, CircularProgress, Alert } from "@mui/material";
import { ethers } from "ethers";
import { contractConfig } from "../contractConfig";

const LenderDashboard = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBorrowers = async () => {
      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractConfig.contractAddress, contractConfig.abi, signer);

        const borrowerData = await contract.getAllBorrowers();

        const formattedBorrowers = borrowerData.map((borrower, index) => ({
          id: index + 1,
          name: borrower.name,
          phone: borrower.phone,
          email: borrower.email,
        }));

        setBorrowers(formattedBorrowers);
      } catch (error) {
        setError("Error fetching borrower data.");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowers();
  }, []);

  return (
    <Paper sx={{ maxWidth: 600, margin: "auto", mt: 4, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lender Dashboard
      </Typography>

      <Typography variant="h6" gutterBottom>
        Registered Borrowers
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <List>
        {borrowers.length > 0 ? (
          borrowers.map((borrower) => (
            <ListItem key={borrower.id}>
              <ListItemText
                primary={borrower.name}
                secondary={
                  <>
                    <Typography variant="body2">📧 Email: {borrower.email}</Typography>
                    <Typography variant="body2">📞 Phone: {borrower.phone}</Typography>
                    <Typography variant="body2">🏦 Address: {borrower.lenderAddress}</Typography>
                  </>
                }
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">No registered borrowers found.</Typography>
        )}
      </List>
    </Paper>
  );
};

export default LenderDashboard;

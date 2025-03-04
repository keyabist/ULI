import React, { useEffect, useState } from "react";
import { 
  Typography, 
  List, 
  ListItem, 
  Paper, 
  Button, 
  TextField, 
  CircularProgress, 
  Alert, 
  Divider
} from "@mui/material";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import { contractConfig } from "../contractConfig";
import NavBar from "./navbar";

const BorrowerDashboard = () => {
  const [lenders, setLenders] = useState([]);
  const [filteredLenders, setFilteredLenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const navigate = useNavigate();  // Hook for navigation

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

        // Fetch lender addresses
        const lenderAddresses = await contract.getAllLenders();

        const lenderDetails = await Promise.all(
          lenderAddresses.map(async (address) => {
            const lender = await contract.lenders(address);
            return {
              walletAddress: address,
              name: lender.name || "Unknown",
              email: lender.email || "N/A",
              phone: lender.phone || "N/A",
            };
          })
        );

        setLenders(lenderDetails);
        setFilteredLenders(lenderDetails);
      } catch (error) {
        setError("Error fetching lender data.");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLenders();
  }, []);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredLenders(lenders);
    } else {
      setFilteredLenders(
        lenders.filter((lender) =>
          Object.values(lender).some((value) =>
            String(value).toLowerCase().includes(query)
          )
        )
      );
    }
  };

  const handleRequestLoan = (lender) => {
    navigate("/requestForm", { state: { lender } });  // Navigate to request form with lender details
  };

  return (
    <Paper sx={{ width: "80vw", margin: "auto", mt: 4, p: 3, boxShadow: 3, maxHeight: "100vh", overflowY: "auto" }}>
      <NavBar />
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
        Borrower Dashboard
      </Typography>

      <TextField
        fullWidth
        label="Search lenders by name, email, phone, or wallet address"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 2, backgroundColor: "white" }}
      />

      <Typography variant="h5" fontWeight="medium" gutterBottom>
        Available Lenders
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <List>
        {filteredLenders.length > 0 ? (
          filteredLenders.map((lender) => (
            <Paper key={lender.walletAddress} elevation={3} sx={{ mb: 2, p: 2 }}>
              <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h6" fontWeight="bold">Name: {lender.name}</Typography>
                <Typography variant="body2">🏦 Wallet: {lender.walletAddress}</Typography>
                <Typography variant="body2">📧 Email: {lender.email}</Typography>
                <Typography variant="body2">📞 Phone: {lender.phone}</Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 1, alignSelf: "flex-end" }} 
                  onClick={() => handleRequestLoan(lender)}
                >
                  Request Loan
                </Button>
              </ListItem>
            </Paper>
          ))
        ) : (
          <Typography variant="body1">No lenders found.</Typography>
        )}
      </List>
    </Paper>
  );
};

export default BorrowerDashboard;

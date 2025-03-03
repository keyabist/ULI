import React, { useEffect, useState } from "react";
import { 
  Typography, 
  List, 
  ListItem, 
  Paper, 
  Button, 
  TextField, 
  Box, 
  CircularProgress, 
  Alert, 
  Divider
} from "@mui/material";
import { ethers } from "ethers";
import { contractConfig } from "../contractConfig";
import NavBar from "./navbar";

const BorrowerDashboard = () => {
  const [lenders, setLenders] = useState([]);
  const [filteredLenders, setFilteredLenders] = useState([]); // New State for Filtered Data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestingLender, setRequestingLender] = useState(null);
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for Search Query

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
        setFilteredLenders(formattedLenders); // Initialize filtered list
      } catch (error) {
        setError("Error fetching lender data.");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLenders();
  }, []);

  // Handle Loan Request Click
  const handleRequestClick = (lenderAddress) => {
    setRequestingLender(lenderAddress);
    setAmount("");
  };

  // Handle Loan Request Confirmation
  const handleConfirmRequest = async () => {
    if (!amount) return;

    try {
      console.log(`Requesting ${amount} from lender: ${requestingLender}`);
      setRequestingLender(null);
      setAmount("");
    } catch (error) {
      console.error("Loan request error:", error);
    }
  };

  // 🔹 Handle Search Input Change
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredLenders(lenders); // Show all lenders when search is empty
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

  return (
    <Paper
      sx={{
        width: "80vw", // Covers 80% of viewport width
        margin: "auto",
        mt: 4,
        p: 3,
        boxShadow: 3,
        maxHeight: "100vh", // Set a maximum height
        overflowY: "auto", // Enable vertical scrolling
      }}
    >
      <NavBar />
      <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
        Borrower Dashboard
      </Typography>

      {/* 🔍 Search Bar */}
      <TextField
        fullWidth
        label="Search lenders by name, email, phone, or address"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            backgroundColor: "white", // Set background color to white
          },
          "& .MuiInputBase-input": {
            color: "White", // Set text color to black
          },
        }}
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
            <Paper key={lender.id} elevation={3} sx={{ mb: 2, p: 2 }}>
              <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography variant="h6" fontWeight="bold">{lender.name}</Typography>
                <Typography variant="body2">📧 Email: {lender.email}</Typography>
                <Typography variant="body2">📞 Phone: {lender.phone}</Typography>
                <Typography variant="body2">🏦 Address: {lender.address}</Typography>

                {requestingLender === lender.address ? (
                  <Box sx={{ display: "flex", gap: 1, mt: 1, width: "100%" }}>
                    <TextField
                      size="small"
                      label="Enter Amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      fullWidth
                    />
                    <Button variant="contained" color="success" onClick={handleConfirmRequest}>
                      Confirm
                    </Button>
                  </Box>
                ) : (
                  <Button variant="outlined" sx={{ mt: 1 }} onClick={() => handleRequestClick(lender.address)}>
                    Request Loan
                  </Button>
                )}
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

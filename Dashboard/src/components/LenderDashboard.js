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
  Divider,
} from "@mui/material";
import { ethers } from "ethers";
import { contractConfig } from "../contractConfig";
import NavBar from "./navbar";

const LenderDashboard = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]); // New State for Filtered Data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // State for Search Query

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
        const contract = new ethers.Contract(
          contractConfig.contractAddress,
          contractConfig.abi,
          signer
        );

        const borrowerData = await contract.getAllBorrowers();

        const formattedBorrowers = borrowerData.map((borrower, index) => ({
          id: index + 1,
          address: borrower.borrowerAddress, // Assuming borrowerAddress is available
          name: borrower.name,
          phone: borrower.phone,
          email: borrower.email,
        }));

        setBorrowers(formattedBorrowers);
        setFilteredBorrowers(formattedBorrowers); // Initialize filtered list
      } catch (error) {
        setError("Error fetching borrower data.");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowers();
  }, []);

  // 🔹 Handle Search Input Change
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === "") {
      setFilteredBorrowers(borrowers); // Show all borrowers when search is empty
    } else {
      setFilteredBorrowers(
        borrowers.filter((borrower) =>
          Object.values(borrower).some((value) =>
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
        Lender Dashboard
      </Typography>

      {/* 🔍 Search Bar */}
      <TextField
        fullWidth
        label="Search borrowers by name, email, phone, or address"
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
            color: "black", // Set text color to black
          },
        }}
      />

      <Typography variant="h5" fontWeight="medium" gutterBottom>
        Registered Borrowers
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      <List>
        {filteredBorrowers.length > 0 ? (
          filteredBorrowers.map((borrower) => (
            <Paper key={borrower.id} elevation={3} sx={{ mb: 2, p: 2 }}>
              <ListItem
                sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {borrower.name}
                </Typography>
                <Typography variant="body2">📧 Email: {borrower.email}</Typography>
                <Typography variant="body2">📞 Phone: {borrower.phone}</Typography>
                <Typography variant="body2">🏦 Address: {borrower.address}</Typography>
              </ListItem>
            </Paper>
          ))
        ) : (
          <Typography variant="body1">No borrowers found.</Typography>
        )}
      </List>
    </Paper>
  );
};

export default LenderDashboard;
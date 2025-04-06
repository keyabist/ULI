import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import CustomTable from "../components/CustomTable";
import CustomLoader from "../components/CustomLoader";
import Navbar from "../components/navbar";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const RequestStatusPage = () => {
  const [loanRequests, setLoanRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoanRequests = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask not installed");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        const userAddress = (await signer.getAddress()).toLowerCase();
        const loanCount = await contract.nextLoanId();

        let loans = [];
        for (let i = 1; i < loanCount; i++) {
          const loan = await contract.loans(i);
          const status = getLoanStatus(loan.status);

          if (loan.borrower.toLowerCase() === userAddress && status !== "Completed") {
            loans.push({
              loanId: i.toString(),
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              term: loan.repaymentPeriod.toString() + " months",
              status: status,
            });
          }
        }

        setLoanRequests(loans);
        setFilteredRequests(loans);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanRequests();
  }, []);

  const getLoanStatus = (status) => {
    const statuses = ["Pending", "Accepted", "Rejected", "Completed"];
    return statuses[status] || "Unknown";
  };

  const filterRequests = (filter) => {
    setActiveFilter(filter);
    if (filter === "all") {
      setFilteredRequests(loanRequests);
    } else if (filter === "accepted_rejected") {
      setFilteredRequests(loanRequests.filter((req) => req.status === "Accepted" || req.status === "Rejected"));
    } else {
      setFilteredRequests(loanRequests.filter((req) => req.status.toLowerCase() === filter));
    }
  };

  const handleRowClick = (row) => {
    // Navigate to loan details page when row is clicked
    navigate(`/loanStatus/${row.loanId}`);
  };

  // Status cell rendering with appropriate colors
  const renderStatus = (status) => {
    let color = "#EAECEF"; // default

    if (status === "Accepted") {
      color = "#28a745"; // green
    } else if (status === "Rejected") {
      color = "#ff4d4d"; // red
    } else if (status === "Pending") {
      color = "#ffc107"; // yellow/amber
    }

    return (
      <Typography sx={{ color, fontWeight: "bold" }}>
        {status}
      </Typography>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Navbar />
      <Typography variant="h4" gutterBottom sx={{ color: "#EAECEF" }}>
        Your Loan Requests
      </Typography>

      {/* Filter Buttons */}
      <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
        {[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "accepted", label: "Accepted" },
          { value: "rejected", label: "Rejected" },
          { value: "accepted_rejected", label: "Accepted & Rejected" }
        ].map((filter) => (
          <Box
            key={filter.value}
            onClick={() => filterRequests(filter.value)}
            sx={{
              p: 1,
              px: 2,
              borderRadius: "5px",
              backgroundColor: activeFilter === filter.value ? "#28a745" : "#333",
              color: activeFilter === filter.value ? "#ffffff" : "#EAECEF",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: activeFilter === filter.value ? "#218838" : "#444",
              },
              transition: "background-color 0.2s",
            }}
          >
            {filter.label}
          </Box>
        ))}
      </Box>

      {loading ? (
        <CustomLoader />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredRequests.length === 0 ? (
        <Typography sx={{ color: "#EAECEF" }}>No requests found for this filter.</Typography>
      ) : (
        <CustomTable
          data={filteredRequests}
          columns={[
            { label: "Loan ID", field: "loanId" },
            { label: "Amount", field: "amount", align: "right" },
            { label: "Interest Rate", field: "interestRate", align: "right" },
            { label: "Term", field: "term", align: "right" },
            { 
              label: "Status", 
              field: "status", 
              align: "center",
              render: renderStatus
            },
          ]}
          onRowClick={handleRowClick}
        />
      )}
    </Box>
  );
};

export default RequestStatusPage;
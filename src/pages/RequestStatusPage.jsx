// src/pages/RequestStatusPage.jsx

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
// Navbar import removed
import CustomLoader from "../components/CustomLoader";
import ProfileModal from "../components/ProfileModal";
// Sidebar (or Siderbar) as before
import Sidebar from "../components/Siderbar";
import "./RequestStatusPage.css";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const RequestStatusPage = () => {
  const [loanRequests, setLoanRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(["all"]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
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
          const statusText = getLoanStatus(loan.status);

          if (
            loan.borrower.toLowerCase() === userAddress &&
            statusText !== "Completed"
          ) {
            const borrowerProfile = await contract.getBorrowerProfile(
              loan.borrower
            );
            loans.push({
              loanId: i.toString(),
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              term: loan.repaymentPeriod.toString() + " months",
              status: statusText,
              borrowerName: borrowerProfile.name,
              borrowerAddress: loan.borrower,
              creditScore: borrowerProfile.creditScore.toString(),
              monthlyIncome: borrowerProfile.monthlyIncome.toString(),
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

  const toggleStatusFilter = (status) => {
    const newStatuses = new Set(selectedStatuses);

    if (status === "all") {
      newStatuses.clear();
      newStatuses.add("all");
    } else {
      newStatuses.delete("all");
      newStatuses.has(status)
        ? newStatuses.delete(status)
        : newStatuses.add(status);
      if (newStatuses.size === 0) newStatuses.add("all");
    }

    setSelectedStatuses(newStatuses);

    if (newStatuses.has("all")) {
      setFilteredRequests(loanRequests);
    } else {
      setFilteredRequests(
        loanRequests.filter((req) =>
          newStatuses.has(req.status.toLowerCase())
        )
      );
    }
  };

  const handleRowClick = (loanId) => {
    navigate(`/loanStatus/${loanId}`);
  };

  const renderStatus = (status) => {
    let color = "#EAECEF";
    if (status === "Accepted") color = "#28a745";
    else if (status === "Rejected") color = "#ff4d4d";
    return <span style={{ color, fontWeight: "bold" }}>{status}</span>;
  };

  const renderBorrowerName = (loan) => (
    <Link
      component="button"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedProfile({
          name: loan.borrowerName,
          address: loan.borrowerAddress,
          creditScore: loan.creditScore,
          monthlyIncome: loan.monthlyIncome,
        });
        setModalOpen(true);
      }}
      sx={{
        color: "#00ff80",
        textDecoration: "none",
        fontWeight: "bold",
        cursor: "pointer",
      }}
    >
      {loan.borrowerName}
    </Link>
  );

  return (
    <div className="profile-page">
      <Sidebar />
      <div className="profile-container">
        {/* Navbar removed from here */}

        <div className="profile-title">
          <h2>Your Loan Requests</h2>
        </div>

        <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "accepted", label: "Accepted" },
            { value: "rejected", label: "Rejected" },
          ].map((filter) => (
            <Box
              key={filter.value}
              className={`filter-button ${
                selectedStatuses.has(filter.value) ? "active" : ""
              }`}
              onClick={() => toggleStatusFilter(filter.value)}
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
          <Typography>No requests found for this filter.</Typography>
        ) : (
          <div className="table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Borrower</th>
                  <th>Amount</th>
                  <th>Interest Rate</th>
                  <th>Term</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((loan) => (
                  <tr
                    key={loan.loanId}
                    onClick={() => handleRowClick(loan.loanId)}
                    className="request-row"
                  >
                    <td>{loan.loanId}</td>
                    <td>{renderBorrowerName(loan)}</td>
                    <td style={{ textAlign: "right" }}>{loan.amount}</td>
                    <td style={{ textAlign: "right" }}>
                      {loan.interestRate}
                    </td>
                    <td style={{ textAlign: "right" }}>{loan.term}</td>
                    <td style={{ textAlign: "center" }}>
                      {renderStatus(loan.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ProfileModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          profile={selectedProfile}
        />
      </div>
    </div>
  );
};

export default RequestStatusPage;

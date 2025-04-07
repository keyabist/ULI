import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import Navbar from "../components/navbar";
import AnimatedList from "../components/AnimatedList";
import CustomLoader from "../components/CustomLoader";
import ProfileModal from "../components/ProfileModal";
import Sidebar from "../components/Siderbar";
import "../styles/RequestStatusPage.css"; // Make sure this path is correct

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

          if (loan.borrower.toLowerCase() === userAddress && statusText !== "Completed") {
            const borrowerProfile = await contract.getBorrowerProfile(loan.borrower);
            const creditScore = borrowerProfile.creditScore.toString();

            loans.push({
              loanId: i.toString(),
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              term: loan.repaymentPeriod.toString() + " months",
              status: statusText,
              borrower: (
                <Link
                  component="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile({
                      name: borrowerProfile.name,
                      address: loan.borrower,
                      creditScore,
                      monthlyIncome: borrowerProfile.monthlyIncome.toString(),
                    });
                    setModalOpen(true);
                  }}
                  style={{
                    color: "#00ff80",
                    textDecoration: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {borrowerProfile.name}
                </Link>
              ),
              profile: {
                name: borrowerProfile.name,
                address: loan.borrower,
                creditScore,
                monthlyIncome: borrowerProfile.monthlyIncome.toString(),
              },
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
      newStatuses.delete("all"); // remove 'all' if a specific status is selected

      if (newStatuses.has(status)) {
        newStatuses.delete(status);
      } else {
        newStatuses.add(status);
      }

      // if nothing selected, fallback to "all"
      if (newStatuses.size === 0) {
        newStatuses.add("all");
      }
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

  const handleRowClick = (row) => {
    navigate(`/loanStatus/${row.loanId}`);
  };

  const renderStatus = (status) => {
    let color = "#EAECEF";
    if (status === "Accepted") color = "#28a745";
    else if (status === "Rejected") color = "#ff4d4d";
    else if (status === "Pending") color = "#ffc107";

    return <Typography sx={{ color, fontWeight: "bold" }}>{status}</Typography>;
  };

  const requestItems = filteredRequests.map((row) => (
    <span key={row.loanId} className="request-row" onClick={() => handleRowClick(row)}>
      <span style={{ width: "10%", fontWeight: "bold" }}>{row.loanId}</span>
      <span style={{ width: "20%" }}>{row.borrower}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.amount}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.interestRate}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.term}</span>
      <span style={{ width: "25%", textAlign: "center" }}>{renderStatus(row.status)}</span>
    </span>
  ));

  return (
    <div className="profile-page">
      <Sidebar />
      <div className="profile-container">
        <div className="profile-title">
          <h2>Your Loan Requests</h2>
        </div>

        {/* Filter Buttons */}
        <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
          {[
            { value: "all", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "accepted", label: "Accepted" },
            { value: "rejected", label: "Rejected" },
          ].map((filter) => (
            <Box
              key={filter.value}
              className={`filter-button ${selectedStatuses.has(filter.value) ? "active" : ""}`}
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
          <>
            <div className="request-header">
              <span>Loan ID</span>
              <span>Borrower</span>
              <span style={{ textAlign: "right" }}>Amount</span>
              <span style={{ textAlign: "right" }}>Interest Rate</span>
              <span style={{ textAlign: "right" }}>Term</span>
              <span style={{ textAlign: "center" }}>Status</span>
            </div>
            <AnimatedList
              items={requestItems}
              onItemSelect={(item, index) => handleRowClick(filteredRequests[index])}
              className="w-full"
              itemClassName=""
            />
          </>
        )}

        <ProfileModal open={modalOpen} onClose={() => setModalOpen(false)} profile={selectedProfile} />
      </div>
    </div>
  );
};

export default RequestStatusPage;

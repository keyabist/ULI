import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Box, Typography, Alert } from "@mui/material";
import contractABI from "../contracts/abi.json";
import AnimatedList from "../components/AnimatedList";
import CustomLoader from "../components/CustomLoader";
import ProfileModal from "../components/ProfileModal"; // <-- Import the modal

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const RejectedLoans = () => {
  const [rejectedLoans, setRejectedLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    const fetchRejectedLoans = async () => {
      setLoading(true);
      try {
        if (!window.ethereum) throw new Error("MetaMask not installed");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        const userAddress = (await signer.getAddress()).toLowerCase();
        const loanCount = await contract.nextLoanId();

        const loans = [];
        for (let i = 1; i < loanCount; i++) {
          const loan = await contract.loans(i);
          if (loan.lender.toLowerCase() === userAddress && loan.status.toString() === "2") {
            const borrowerProfile = await contract.getBorrowerProfile(loan.borrower);
            const username = borrowerProfile.name;
            const creditScore = borrowerProfile.creditScore.toString();
            const monthlyIncome = borrowerProfile.monthlyIncome.toString();

            loans.push({
              loanId: loan.loanId.toString(),
              profile: {
                name: username,
                address: loan.borrower,
                creditScore,
                monthlyIncome,
              },
              creditScore,
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              term: loan.repaymentPeriod.toString() + " months",
              status: "Rejected",
            });
          }
        }
        setRejectedLoans(loans);
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedLoans();
  }, []);

  const handleRowClick = (row) => {
    // Optional: navigate to loan details
  };

  const loanItems = rejectedLoans.map((row) => (
    <span
      key={row.loanId}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        fontSize: "0.9rem",
        backgroundColor: "#222",
        borderRadius: "4px",
        padding: "8px",
        marginBottom: "8px",
      }}
    >
      <span style={{ width: "10%", fontWeight: "bold" }}>{row.loanId}</span>
      <span
        style={{ width: "25%", cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedProfile(row.profile);
          setModalOpen(true);
        }}
      >
        <span style={{ color: "#28a745", textDecoration: "underline", fontWeight: "bold" }}>
          {row.profile.name}
        </span>
      </span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.creditScore}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.amount}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.interestRate}</span>
      <span style={{ width: "20%", textAlign: "right" }}>{row.term}</span>
    </span>
  ));

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Rejected Loans
      </Typography>

      {loading ? (
        <CustomLoader />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : rejectedLoans.length === 0 ? (
        <Typography>No rejected loans found.</Typography>
      ) : (
        <>
          {/* Header Row */}
          <Box
            sx={{
              backgroundColor: "#181818",
              p: 1,
              display: "flex",
              alignItems: "center",
              borderRadius: "4px",
              mb: 2,
            }}
          >
            <Typography sx={{ width: "10%", color: "#28a745", fontWeight: "bold" }}>
              Loan ID
            </Typography>
            <Typography sx={{ width: "25%", color: "#28a745", fontWeight: "bold" }}>
              Borrower
            </Typography>
            <Typography sx={{ width: "15%", color: "#28a745", fontWeight: "bold", textAlign: "right" }}>
              Credit Score
            </Typography>
            <Typography sx={{ width: "15%", color: "#28a745", fontWeight: "bold", textAlign: "right" }}>
              Amount
            </Typography>
            <Typography sx={{ width: "15%", color: "#28a745", fontWeight: "bold", textAlign: "right" }}>
              Interest Rate
            </Typography>
            <Typography sx={{ width: "20%", color: "#28a745", fontWeight: "bold", textAlign: "right" }}>
              Term
            </Typography>
          </Box>

          <AnimatedList
            items={loanItems}
            onItemSelect={(item, index) => handleRowClick(rejectedLoans[index])}
            className="w-full"
            itemClassName=""
          />

          {/* Profile Modal */}
          <ProfileModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            profile={selectedProfile}
          />
        </>
      )}
    </Box>
  );
};

export default RejectedLoans;

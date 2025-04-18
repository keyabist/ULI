import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import NavbarLender from "../components/navbarLender";
import NavBar from "../components/navbar";
import AnimatedList from "../components/AnimatedList";
import CustomLoader from "../components/CustomLoader";
import { Alert, Typography, Box, Link } from "@mui/material";
import ProfileModal from "../components/ProfileModal";
import Sidebar from "../components/Siderbar";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const CompletedLoansPage = () => {
  const [completedLoans, setCompletedLoans] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedLoans = async () => {
      try {
        if (!window.ethereum) throw new Error("MetaMask is not installed.");

        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        const userAddress = (await signer.getAddress()).toLowerCase();
        const loanCount = await contract.nextLoanId();
        const borrowerData = await contract.borrowers(userAddress);
        const lenderData = await contract.lenders(userAddress);

        const role = borrowerData.isRegistered
          ? "borrower"
          : lenderData.isRegistered
          ? "lender"
          : "unknown";

        if (role === "unknown") {
          throw new Error("User role could not be determined.");
        }

        setUserRole(role);

        let loans = [];
        for (let i = 1; i < loanCount; i++) {
          const loan = await contract.loans(i);

          if (
            (loan.lender.toLowerCase() === userAddress ||
              loan.borrower.toLowerCase() === userAddress) &&
            loan.status.toString() === "3"
          ) {
            const borrowerProfile = await contract.getBorrowerProfile(loan.borrower);
            const username = borrowerProfile.name;
            const creditScore = borrowerProfile.creditScore.toString();

            loans.push({
              loanId: loan.loanId.toString(),
              borrowerAddress: loan.borrower,
              profile: {
                name: borrowerProfile.name,
                address: loan.borrower,
                creditScore,
                monthlyIncome: borrowerProfile.monthlyIncome.toString(),
              },
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
                    color: "#28a745",
                    textDecoration: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {username}
                </Link>
              ),
              creditScore,
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              repaymentPeriod: loan.repaymentPeriod.toString() + " months",
            });
          }
        }

        setCompletedLoans(loans);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedLoans();
  }, []);

  const handleRowClick = (row) => {
    navigate(`/loanStatus/${row.loanId}`);
  };

  const loanItems = completedLoans.map((row) => (
    <span
      key={row.loanId}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        fontSize: "0.9rem",
        backgroundColor: "#111",
        borderRadius: "4px",
        padding: "8px",
        marginBottom: "8px",
      }}
    >
      <span style={{ width: "10%", fontWeight: "bold" }}>{row.loanId}</span>
      <span style={{ width: "25%" }}>{row.borrower}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.creditScore}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.amount}</span>
      <span style={{ width: "15%", textAlign: "right" }}>{row.interestRate}</span>
      <span style={{ width: "20%", textAlign: "right" }}>{row.repaymentPeriod}</span>
    </span>
  ));

  return (
    <div className="profile-page">
      <div className="profile-container">
        <Sidebar />

        <div className="profile-title">
          <Typography variant="h4" gutterBottom>
            Completed Loans
          </Typography>
        </div>

        {loading ? (
          <CustomLoader />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : completedLoans.length === 0 ? (
          <Typography>No Completed Loans Found</Typography>
        ) : (
          <>
            <Box className="custom-table-header" sx={{ display: "flex", backgroundColor: "#181818", p: 1, borderRadius: "4px", mb: 2 }}>
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
                Repayment Period
              </Typography>
            </Box>
            <AnimatedList
              items={loanItems}
              onItemSelect={(item, index) => handleRowClick(completedLoans[index])}
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

export default CompletedLoansPage;

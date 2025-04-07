import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link, useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import NavbarLender from "../components/navbarLender";
import NavBar from "../components/navbar";
import AnimatedList from "../components/AnimatedList";
import CustomLoader from "../components/CustomLoader"; // Assuming you have a loader component
import { Alert, Typography, Box } from "@mui/material";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const CompletedLoansPage = () => {
  const [completedLoans, setCompletedLoans] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompletedLoans = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("MetaMask is not installed.");
        }

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
            (loan.lender.toLowerCase() === userAddress || loan.borrower.toLowerCase() === userAddress) &&
            loan.status.toString() === "3"
          ) {
            // Fetch borrower profile for username and credit score
            const borrowerProfile = await contract.getBorrowerProfile(loan.borrower);
            const username = borrowerProfile.name;
            const creditScore = borrowerProfile.creditScore.toString();

            loans.push({
              loanId: loan.loanId.toString(),
              borrower: (
                <Link
                  to={`/view-profile/${loan.borrower}`}
                  onClick={(e) => e.stopPropagation()} // Prevent row click event
                  style={{ color: "#28a745", textDecoration: "none", fontWeight: "bold" }}
                >
                  {username}
                </Link>
              ),
              creditScore, // New column for credit score
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
    // Navigate to loan status page when row (except borrower link) is clicked
    navigate(`/loanStatus/${row.loanId}`);
  };

  // Map completedLoans into a list of JSX rows with a dark grey background (#111)
  const loanItems = completedLoans.map((row) => (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        fontSize: "0.9rem",
        backgroundColor: "#111", // dark grey background for each row
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
    <Box className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md" sx={{ p: 2, mt: 5 }}>
      {/* Uncomment the appropriate Navbar if needed */}
      {/* {userRole === "borrower" ? <NavBar /> : <NavbarLender />} */}

      <Typography variant="h4" gutterBottom>
        Completed Loans
      </Typography>

      {loading ? (
        <CustomLoader />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : completedLoans.length === 0 ? (
        <Typography>No Completed Loans Found</Typography>
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
    </Box>
  );
};

export default CompletedLoansPage;

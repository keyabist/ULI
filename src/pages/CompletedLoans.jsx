import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Link, useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";
import CustomTable from "../components/CustomTable";
import CustomLoader from "../components/CustomLoader";
import { Alert, Typography } from "@mui/material";

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

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Completed Loans</h2>

      {loading ? (
        <CustomLoader />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : completedLoans.length === 0 ? (
        <Typography>No Completed Loans Found</Typography>
      ) : (
        <CustomTable
          data={completedLoans}
          columns={[
            { label: "Loan ID", field: "loanId" },
            { label: "Borrower", field: "borrower" },
            { label: "Credit Score", field: "creditScore", align: "right" },
            { label: "Amount", field: "amount", align: "right" },
            { label: "Interest Rate", field: "interestRate", align: "right" },
            { label: "Repayment Period", field: "repaymentPeriod", align: "right" },
          ]}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
};

export default CompletedLoansPage;

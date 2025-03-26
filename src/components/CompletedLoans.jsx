import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import NavbarLender from "./navbarLender";
import NavBar from "./navbar";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const CompletedLoansPage = () => {
  const [completedLoans, setCompletedLoans] = useState([]);
  const [provider, setProvider] = useState(null);
  const [userRole, setUserRole] = useState(false);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }
    const p = new ethers.BrowserProvider(window.ethereum);
    setProvider(p);
    p.getSigner()
      .then((s) => {
        setSigner(s);
        const c = new ethers.Contract(CONTRACT_ADDRESS, contractABI, s);
        setContract(c);
      })
      .catch((error) => {
        console.error("Error getting signer:", error);
      });
  }, []);

  useEffect(() => {
    const fetchCompletedLoans = async () => {
      if (!contract || !signer) return;
      try {
        const userAddress = (await signer.getAddress()).toLowerCase();
        const loanCount = await contract.nextLoanId();

        let loans = [];
        for (let i = 1; i < loanCount; i++) {
          const loan = await contract.loans(i);
          
          const [borrower, lender] = await Promise.all([
            contract.borrowers(userAddress),
            contract.lenders(userAddress),
          ]);

          
          if ((loan.lender.toLowerCase() === userAddress || loan.borrower.toLowerCase() === userAddress)  && loan.status.toString() === "3") {
            loans.push({
              loanId: loan.loanId.toString(),
              amount: ethers.formatUnits(loan.amount, 18) + " ETH",
              interestRate: loan.interestRate.toString() + "%",
              repaymentPeriod: loan.repaymentPeriod.toString() + " months",
              status: "Completed",
              borrower: loan.borrower
            });
          }

        }
        
        const borrowerData = await contract.borrowers(userAddress);
        const lenderData = await contract.lenders(userAddress);
        const role = borrowerData.isRegistered
          ? "borrower"
          : lenderData.isRegistered
          ? "lender"
          : "unknown";
          
        setUserRole(role);
        setCompletedLoans(loans);
      } catch (error) {
        console.error("Error fetching completed loans:", error);
      }
    };

    fetchCompletedLoans();
  }, [contract, signer]);

  const getLoanStatus = (status) => {
    const statuses = ["Pending", "Accepted", "Rejected", "Completed"];
    return statuses[status] || "Unknown";
  };

  if (userRole === "unknown") {
    throw new Error("User role could not be determined.");
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">

      {userRole === 'borrower' ? <NavBar /> :<NavbarLender /> }
      
      <h2 className="text-xl font-bold mb-4">Completed Loans</h2>
      {completedLoans.length === 0 ? (
        <p>No completed loans found.</p>
      ) : (
        <ul>
          {completedLoans.map((loan) => (
            <li key={loan.loanId}>
              <strong>Loan ID:</strong> {loan.loanId} – <strong>Amount:</strong> {loan.amount} – <strong>Borrower:</strong> {loan.borrower}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CompletedLoansPage;

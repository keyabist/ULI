import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const CONTRACT_ADDRESS = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

const CompletedLoansPage = () => {
  const [completedLoans, setCompletedLoans] = useState([]);
  const [provider, setProvider] = useState(null);
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
      if (contract && signer) {
        try {
          const userAddress = (await signer.getAddress()).toLowerCase();
          // Replace the following with your method to fetch loans, for example:
          // const loans = await contract.getLoansByStatus(userAddress, 3); // 3 for Completed
          // For demo, we assume an empty list or hardcoded data:
          const loans = [
            { loanId: 1, amount: "1.5 ETH", borrower: "0x...", status: "Completed" },
            { loanId: 2, amount: "2 ETH", borrower: "0x...", status: "Completed" },
          ];
          setCompletedLoans(loans);
        } catch (error) {
          console.error("Error fetching completed loans:", error);
        }
      }
    };

    fetchCompletedLoans();
  }, [contract, signer]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
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

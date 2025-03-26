import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const CONTRACT_ADDRESS = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

const RejectedLoansPage = () => {
  const [rejectedLoans, setRejectedLoans] = useState([]);
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
    const fetchRejectedLoans = async () => {
      if (contract && signer) {
        try {
          const userAddress = (await signer.getAddress()).toLowerCase();
          // Replace with your contract method to fetch rejected loans:
          // const loans = await contract.getLoansByStatus(userAddress, 2); // 2 for Rejected
          const loans = [
            { loanId: 3, amount: "0.8 ETH", borrower: "0x...", status: "Rejected" },
          ];
          setRejectedLoans(loans);
        } catch (error) {
          console.error("Error fetching rejected loans:", error);
        }
      }
    };

    fetchRejectedLoans();
  }, [contract, signer]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Rejected Loans</h2>
      {rejectedLoans.length === 0 ? (
        <p>No rejected loans found.</p>
      ) : (
        <ul>
          {rejectedLoans.map((loan) => (
            <li key={loan.loanId}>
              <strong>Loan ID:</strong> {loan.loanId} – <strong>Amount:</strong> {loan.amount} – <strong>Borrower:</strong> {loan.borrower}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RejectedLoansPage;

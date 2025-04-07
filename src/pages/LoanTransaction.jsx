import { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import Sidebar from "../components/Siderbar";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

export default function LoanStatus({ account }) {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    fetchLoans();
  }, [account]);

  async function fetchLoans() {
    if (!account) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
    const loanIds = await contract.nextLoanId();
    let fetchedLoans = [];
    
    for (let i = 1; i < loanIds; i++) {
      const loan = await contract.loans(i);
      if (loan.borrower.toLowerCase() === account.toLowerCase()) {
        fetchedLoans.push({ id: i, ...loan });
      }
    }
    setLoans(fetchedLoans);
  }

  async function makeRepayment(loanId) {
    if (!amount) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    const txn = await contract.recordPayment(loanId, ethers.utils.parseEther(amount));
    await txn.wait();
    alert("Payment successful!");
    fetchLoans();
  }

  return (
    <div className="p-4">
      <Sidebar />
      <h2 className="text-xl font-bold">Loan Status</h2>
      {loans.length === 0 ? (
        <p>No loans found.</p>
      ) : (
        loans.map((loan) => (
          <div key={loan.id} className="border p-4 my-2">
            <p><b>Loan ID:</b> {loan.id}</p>
            <p><b>Amount:</b> {ethers.utils.formatEther(loan.amount.toString())} ETH</p>
            <p><b>Amount Paid:</b> {ethers.utils.formatEther(loan.amountPaid.toString())} ETH</p>
            <p><b>Status:</b> {loan.status === 0 ? "Pending" : loan.status === 1 ? "Approved" : loan.status === 2 ? "Rejected" : "Completed"}</p>
            {loan.status === 1 && loan.amountPaid < loan.amount && (
              <div>
                <input type="number" placeholder="Enter repayment amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-2" />
                <button onClick={() => makeRepayment(loan.id)} className="bg-blue-500 text-white p-2 ml-2">Make Repayment</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const CONTRACT_ADDRESS = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

const TransactionPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Expecting state to contain: loanId, installmentAmount, and lender (as recipient)
  const { loanId, installmentAmount, lender } = state || {};

  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize provider, signer, and contract only once
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

  // If no loanId, check the current user’s role and navigate accordingly
  useEffect(() => {
    const checkUserRole = async () => {
      if (!loanId && provider && signer && contract) {
        try {
          const userAddress = (await signer.getAddress()).toLowerCase();
          // Check if the user is a registered borrower
          const borrower = await contract.borrowers(userAddress);
          if (borrower.isRegistered) {
            navigate("/borrowerDashboard");
          } else {
            // Otherwise check if they are a registered lender
            const lenderData = await contract.lenders(userAddress);
            if (lenderData.isRegistered) {
              navigate("/lenderDashboard");
            } else {
              // Fallback: if not registered, send to registration page
              navigate("/register");
            }
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      }
    };

    checkUserRole();
  }, [loanId, provider, signer, contract, navigate]);

  const handleTransaction = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }
    try {
      setLoading(true);
      // We already have provider, signer, and contract from our initialization
      const amountInWei = ethers.parseEther(installmentAmount.toString());

      // Send ETH to the recipient (lender)
      const txPayment = await signer.sendTransaction({
        to: lender,
        value: amountInWei,
      });
      await txPayment.wait();
      alert("Transaction Successful! Recording payment...");

      // Record the payment in the contract. recordPayment will update amountPaid and, if paid in full, mark as Completed.
      const txRecord = await contract.recordPayment(loanId, amountInWei);
      await txRecord.wait();
      alert("Payment recorded! Loan status updated accordingly.");

      navigate("/borrowerDashboard");
    } catch (error) {
      console.error("Transaction Error:", error);
      alert("Transaction Failed!");
      // If transaction fails, attempt to reject the loan
      try {
        const txReject = await contract.rejectLoan(loanId);
        await txReject.wait();
        alert("Loan Declined!");
      } catch (err) {
        console.error("Error declining loan:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Confirm Loan Transaction</h2>
      <p><b>Loan ID:</b> {loanId}</p>
      <p><b>Amount (ETH):</b> {installmentAmount}</p>
      <p><b>Recipient Address:</b> {lender}</p>
      <button
        onClick={handleTransaction}
        className="bg-blue-500 text-white p-2 rounded mt-4"
        disabled={loading}
      >
        {loading ? "Processing..." : "Confirm & Pay"}
      </button>
    </div>
  );
};

export default TransactionPage;

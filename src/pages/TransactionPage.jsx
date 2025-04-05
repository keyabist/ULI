import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const TransactionPage = () => {
  // ... existing state and logic remains unchanged ...
  const { state } = useLocation();
  const navigate = useNavigate();
  // Expected state: loanId, installmentAmount, recipient, role ("lender" or "borrower")
  const { loanId, installmentAmount, recipient, role } = state || {};

  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);

  // Initialize provider, signer, and contract once.
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

  // If no loanId is provided, check the current user’s role and redirect accordingly.
  useEffect(() => {
    const checkUserRole = async () => {
      if (!loanId && provider && signer && contract) {
        try {
          const userAddress = (await signer.getAddress()).toLowerCase();
          const borrowerData = await contract.borrowers(userAddress);
          if (borrowerData.isRegistered) {
            navigate("/borrowerDashboard");
          } else {
            const lenderData = await contract.lenders(userAddress);
            if (lenderData.isRegistered) {
              navigate("/lenderDashboard");
            } else {
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

  // Helper: Count completed loans for the given user address.
  // Completed means loan.status equals "3" (Completed).
  const countCompletedLoans = async (userAddress) => {
    const nextLoanIdBN = await contract.nextLoanId();
    const nextLoanId = Number(nextLoanIdBN);
    let completedCount = 0;
    for (let i = 1; i < nextLoanId; i++) {
      const loan = await contract.loans(i);
      if (
        (loan.borrower.toLowerCase() === userAddress ||
          loan.lender.toLowerCase() === userAddress) &&
        loan.status.toString() === "3"
      ) {
        completedCount++;
      }
    }
    return completedCount;
  };

  // Helper: Calculate the updated credit score.
  // For borrowers: base increment 5 plus 1 per completed loan.
  // For lenders: base increment 3 plus 1 per completed loan.
  // Additionally, if the loan is fully repaid, add a bonus equal to 2% of the current score.
  const calculateUpdatedCreditScore = (currentScore, installment, completedCount, isLoanCompleted, role) => {
    let increment = 0;
    if (role === "borrower") {
      increment = 5 + completedCount * 1;
    } else if (role === "lender") {
      increment = 3 + completedCount * 1;
    }
    const bonus = isLoanCompleted ? currentScore * 0.02 : 0;
    return Math.floor(currentScore + increment + bonus);
  };

  // Helper: Update the credit score on-chain using the profile update functions.
  const updateCreditScore = async (newScore, role) => {
    const userAddress = await signer.getAddress();
    if (role === "borrower") {
      const profileData = await contract.getBorrowerProfile(userAddress);
      // Borrower struct mapping:
      // [0]: borrowerAddress, [1]: name, [2]: phone, [3]: email, [4]: creditScore, [5]: monthlyIncome, [6]: isRegistered, [7]: govidCID, [8]: signatureCID
      const updatedProfile = {
        name: profileData[1],
        phone: profileData[2],
        email: profileData[3],
        creditScore: newScore,
        interestRate: 0, // For borrowers, set interestRate to 0.
        monthlyIncome: profileData[5],
        govidCID: profileData[7],
        signatureCID: profileData[8],
      };
      const tx = await contract.updateBorrowerProfile(updatedProfile);
      await tx.wait();
    } else if (role === "lender") {
      const profileData = await contract.getLenderProfile(userAddress);
      // Lender struct mapping:
      // [0]: lenderAddress, [1]: name, [2]: phone, [3]: email, [4]: interestRate, [5]: monthlyIncome, [6]: creditScore, [7]: isRegistered, [8]: govidCID, [9]: signatureCID
      const updatedProfile = {
        name: profileData[1],
        phone: profileData[2],
        email: profileData[3],
        interestRate: profileData[4],
        monthlyIncome: profileData[5],
        creditScore: newScore,
        govidCID: profileData[8],
        signatureCID: profileData[9],
      };
      const tx = await contract.updateLenderProfile(updatedProfile);
      await tx.wait();
    }
  };

  const handleTransaction = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }
    try {
      setLoading(true);
      const amountInWei = ethers.parseEther(installmentAmount.toString());

      // Send ETH to the recipient.
      const txPayment = await signer.sendTransaction({
        to: recipient,
        value: amountInWei,
      });
      await txPayment.wait();
      alert("Transaction Successful! Recording payment...");

      let tx;
      if (role === "lender") {
        tx = await contract.approveLoan(loanId);
        await tx.wait();
        alert("Loan Approved!");
      } else {
        tx = await contract.recordPayment(loanId, amountInWei);
        await tx.wait();
        alert("Payment recorded! Loan status updated accordingly.");
      }

      // --- Begin Credit Score Calculation ---
      const userAddress = (await signer.getAddress()).toLowerCase();
      const completedCount = await countCompletedLoans(userAddress);

      // Fetch the current loan details.
      const loanDetails = await contract.loans(loanId);
      // In ethers v6, BigInt arithmetic is used. Check if the remaining amount is zero.
      const isLoanCompleted = (loanDetails.amount - loanDetails.amountPaid) === 0n;

      let currentScore = 0;
      if (role === "borrower") {
        const profileData = await contract.getBorrowerProfile(userAddress);
        currentScore = parseInt(profileData[4]); // creditScore is at index 4.
      } else if (role === "lender") {
        const profileData = await contract.getLenderProfile(userAddress);
        currentScore = parseInt(profileData[6]); // creditScore is at index 6.
      }

      const newScore = calculateUpdatedCreditScore(currentScore, installmentAmount, completedCount, isLoanCompleted, role);
      await updateCreditScore(newScore, role);
      alert("Credit score updated successfully!");
      // --- End Credit Score Calculation ---

      // Navigate back to the appropriate dashboard.
      if (role === "lender") {
        navigate("/lenderDashboard");
      } else {
        navigate("/borrowerDashboard");
      }
    } catch (error) {
      console.error("Transaction Error:", error);
      alert("Transaction Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '30px',
      background: 'linear-gradient(135deg, #0a0a0a, #222)',
      borderRadius: '12px',
      border: '2px solid #00ff80',
      boxShadow: '0 0 20px 5px rgba(0, 255, 128, 0.3)',
      color: '#d4edda',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#00ff80',
        fontSize: '1.8rem',
        marginBottom: '25px',
        textShadow: '0 0 10px rgba(0,255,128,0.5)'
      }}>
        Confirm Loan Transaction
      </h2>

      <div style={{ marginBottom: '15px' }}>
        <p style={{ margin: '10px 0' }}>
          <span style={{ color: '#00ff80', fontWeight: 'bold' }}>Loan ID:</span> 
          <span style={{ marginLeft: '10px' }}>{loanId}</span>
        </p>
        <p style={{ margin: '10px 0' }}>
          <span style={{ color: '#00ff80', fontWeight: 'bold' }}>Amount (ETH):</span> 
          <span style={{ marginLeft: '10px' }}>{installmentAmount}</span>
        </p>
        <p style={{ margin: '10px 0' }}>
          <span style={{ color: '#00ff80', fontWeight: 'bold' }}>Recipient:</span> 
          <span style={{ 
            marginLeft: '10px',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            color: '#00cc66'
          }}>
            {recipient}
          </span>
        </p>
      </div>

      <button
        onClick={handleTransaction}
        disabled={loading}
        style={{
          display: 'block',
          width: '100%',
          padding: '12px',
          background: loading ? '#1a1f1f' : '#00cc66',
          color: '#fff',
          border: '1px solid #00ff80',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          marginTop: '20px',
          ...(!loading && {
            ':hover': {
              background: '#00994d',
              transform: 'scale(1.02)',
              boxShadow: '0 0 15px rgba(0,255,128,0.5)'
            }
          })
        }}
      >
        {loading ? (
          <span style={{ color: '#00ff80' }}>Processing Transaction...</span>
        ) : (
          'Confirm & Pay'
        )}
      </button>
    </div>
  );
};

export default TransactionPage;
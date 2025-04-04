import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import { contractConfig } from '../contractConfig';
import './Requestform.css';  // Import the CSS file

const RequestForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve lender data passed from BorrowerDashboard
  const lender = location.state?.lender;
  if (!lender) {
    return <p className="error-message">Error: Lender data not found. Please go back and select a lender.</p>;
  }

  const [formData, setFormData] = useState({
    amountNeeded: '',
    repaymentPeriod: '',
    repaymentSchedule: ''  // For UI only; not stored on-chain.
  });

  // Generate a random UI reference ID (for display/logging only)
  const [uiLoanId, setUiLoanId] = useState('');
  useEffect(() => {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    setUiLoanId(`${Date.now()}-${randomPart}`);
  }, []);

  // For ML Signature Verification
  const [testSignatureFile, setTestSignatureFile] = useState(null);
  const [storedSignatureCID, setStoredSignatureCID] = useState('');
  const [signatureVerified, setSignatureVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Fetch the stored signature CID from the borrower's profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const account = await signer.getAddress();
          const contract = new ethers.Contract(contractConfig.contractAddress, contractConfig.abi, signer);
          // Try borrower mapping first
          const borrowerData = await contract.borrowers(account);
          if (borrowerData.isRegistered) {
            setStoredSignatureCID(borrowerData.signatureCID);
          }
        } catch (error) {
          console.error("Error fetching profile for signature CID:", error);
        }
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Verify signature using the ML model on the backend
  const verifySignature = async () => {
    if (!storedSignatureCID) {
      alert("No stored signature found. Please upload your signature in your profile.");
      return;
    }
    if (!testSignatureFile) {
      alert("Please select a test signature file to verify.");
      return;
    }

    try {
      // Fetch the original signature image from IPFS as blob
      const ipfsUrl = `https://ipfs.io/ipfs/${storedSignatureCID}`;
      const originalResponse = await axios.get(ipfsUrl, { responseType: 'blob' });
      
      // Create form data to send both images
      const formDataToSend = new FormData();
      formDataToSend.append('original', originalResponse.data, 'original.jpg');
      formDataToSend.append('test', testSignatureFile, testSignatureFile.name);

      const response = await axios.post('http://localhost:5000/verify', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setVerificationStatus(response.data.message);
      setSignatureVerified(response.data.match);
    } catch (error) {
      console.error("Error during signature verification:", error);
      alert("Error verifying signature. Check the console for details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signatureVerified) {
      alert("Please verify your signature before submitting the loan request.");
      return;
    }

    try {
      // Connect to MetaMask and get the signer (borrower's account)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractConfig.contractAddress, contractConfig.abi, signer);

      // Call the blockchain function requestLoan to store the loan data.
      const tx = await contract.requestLoan(
        ethers.parseUnits(formData.amountNeeded, 'ether'),
        parseInt(formData.repaymentPeriod),
        lender.walletAddress
      );

      // Wait for transaction confirmation
      await tx.wait();

      console.log("Loan request submitted on-chain. UI Loan Reference ID:", uiLoanId);
      alert("Loan request submitted successfully!");
      navigate("/borrowerDashboard");
    } catch (error) {
      console.error("Error submitting loan request:", error);
      alert("Failed to submit loan request. Check the console for details.");
    }
  };

  return (
    <div className="request-form-container">
      <h2>Loan Request Form</h2>
      <p className="info-text"><strong>Lender Address:</strong> {lender.walletAddress}</p>
      <p className="info-text"><strong>Lender Interest Rate:</strong> {lender.interestRate}%</p>
      <p className="info-text"><strong>Your Loan Reference ID:</strong> {uiLoanId}</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount Needed (in ETH):</label>
          <input
            type="number"
            name="amountNeeded"
            value={formData.amountNeeded}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Repayment Period (in months):</label>
          <input
            type="number"
            name="repaymentPeriod"
            value={formData.repaymentPeriod}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Repayment Schedule:</label>
          <select
            name="repaymentSchedule"
            value={formData.repaymentSchedule}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Schedule</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="form-group">
          <label>Upload Test Signature for Verification:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setTestSignatureFile(e.target.files[0]);
                setSignatureVerified(false);
                setVerificationStatus(null);
              }
            }}
            required
          />
        </div>

        <div className="buttons-container">
          <button type="button" className="verify-button" onClick={verifySignature}>
            Verify Signature
          </button>
        </div>

        {verificationStatus && (
          <p className={`verification-status ${signatureVerified ? 'verified' : 'not-verified'}`}>
            {verificationStatus}
          </p>
        )}

        <button type="submit" className="submit-button">
          Submit Loan Request
        </button>
      </form>
    </div>
  );
};

export default RequestForm;

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import NavBar from './navbar';
import ContractABI from "../contracts/abi.json";

const CONTRACT_ADDRESS = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

const EditProfileForm = () => {
  // Role: "borrower" or "lender"
  const [role, setRole] = useState(null);
  // Common profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  // Borrower-only field
  const [creditScore, setCreditScore] = useState('');
  // Lender-only field
  const [interestRate, setInterestRate] = useState('');
  // Document CIDs (fetched from contract)
  const [govidCID, setGovidCID] = useState('');
  const [signatureCID, setSignatureCID] = useState('');
  // Files (if user uploads a new one)
  const [govidFile, setGovidFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  // To preserve the original verified flag (not editable by user)
  const [verified, setVerified] = useState(false);
  // Loading state for form submission
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // On mount, fetch the current account's profile
  useEffect(() => {
    async function fetchProfile() {
      if (window.ethereum) {
        // Using ethers v6 BrowserProvider
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const account = await signer.getAddress();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);

        try {
          // Try borrower mapping first
          const borrowerData = await contract.borrowers(account);
          if (borrowerData.isRegistered) {
            setRole('borrower');
            setName(borrowerData.name);
            setPhone(borrowerData.phone);
            setEmail(borrowerData.email);
            setCreditScore(borrowerData.creditScore.toString());
            setMonthlyIncome(borrowerData.monthlyIncome.toString());
            setGovidCID(borrowerData.govidCID);
            setSignatureCID(borrowerData.signatureCID);
            setVerified(borrowerData.verified);
            return;
          }
        } catch (error) {
          // If call fails, account might not be a borrower
        }
        try {
          // Try lender mapping if borrower lookup failed
          const lenderData = await contract.lenders(account);
          if (lenderData.isRegistered) {
            setRole('lender');
            setName(lenderData.name);
            setPhone(lenderData.phone);
            setEmail(lenderData.email);
            setInterestRate(lenderData.interestRate.toString());
            setMonthlyIncome(lenderData.monthlyIncome.toString());
            setGovidCID(lenderData.govidCID);
            setSignatureCID(lenderData.signatureCID);
            setVerified(lenderData.verified);
          }
        } catch (error) {
          console.error('Error fetching lender profile:', error);
        }
      }
    }
    fetchProfile();
  }, []);

  // Upload a file to Pinata and return the CID
  async function uploadFileToPinata(file) {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        'pinata_api_key': "631aba7bba8a85658b57", // Replace with your API key
        'pinata_secret_api_key': "ed236116b957abe0293ab4e1101662b755cb01051d78719021b7c9c3114cc693" // Replace with your secret key
      }
    });
    const data = await response.json();
    return data.IpfsHash;
  }

  // Handle the form submission: upload files (if any) then update the blockchain
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);

      // If new files were chosen, upload them; otherwise use the existing CID
      let newGovidCID = govidCID;
      let newSignatureCID = signatureCID;
      if (govidFile) {
        newGovidCID = await uploadFileToPinata(govidFile);
      }
      if (signatureFile) {
        newSignatureCID = await uploadFileToPinata(signatureFile);
      }

      if (role === 'borrower') {
        const tx = await contract.updateBorrowerProfile({
          name: name,
          phone: phone,
          email: email,
          creditScore: creditScore, // Ensure this is numeric if required by your contract
          monthlyIncome: monthlyIncome,
          govidCID: newGovidCID,
          signatureCID: newSignatureCID,
          verified: verified
        });
        await tx.wait();
      } else if (role === 'lender') {
        const tx = await contract.updateLenderProfile({
          name: name,
          phone: phone,
          email: email,
          interestRate: interestRate, // Ensure this is numeric if required
          monthlyIncome: monthlyIncome,
          govidCID: newGovidCID,
          signatureCID: newSignatureCID,
          verified: verified
        });
        await tx.wait();
      }
      alert('Profile updated successfully!');
      if (role === 'borrower') {
        navigate('/borrowerDashboard');
      } else if (role === 'lender') {
        navigate('/lenderDashboard');
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
    setLoading(false);
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, height: 'calc(100vh - 64px)', overflowY: 'auto', pb: 8 }}>
      <NavBar />
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField 
          fullWidth 
          label="Name" 
          variant="outlined" 
          value={name} 
          onChange={(e) => setName(e.target.value)}
        />
        <TextField 
          fullWidth 
          label="Email" 
          variant="outlined" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField 
          fullWidth 
          label="Phone" 
          variant="outlined" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
        />
        {role === 'borrower' && (
          <TextField 
            fullWidth 
            label="Credit Score" 
            variant="outlined" 
            value={creditScore} 
            onChange={(e) => setCreditScore(e.target.value)}
          />
        )}
        {role === 'lender' && (
          <TextField 
            fullWidth 
            label="Interest Rate" 
            variant="outlined" 
            value={interestRate} 
            onChange={(e) => setInterestRate(e.target.value)}
          />
        )}
        <TextField 
          fullWidth 
          label="Monthly Income" 
          variant="outlined" 
          value={monthlyIncome} 
          onChange={(e) => setMonthlyIncome(e.target.value)}
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Documents
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            Current Government ID CID: {govidCID ? govidCID : "Not uploaded"}
          </Typography>
          {govidCID && (
            <Button variant="text" component="a" href={`https://gateway.pinata.cloud/ipfs/${govidCID}`} target="_blank" rel="noopener noreferrer">
              View
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" component="label">
            Upload New Government ID
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setGovidFile(e.target.files[0]);
                }
              }}
            />
          </Button>
          {govidFile && (
            <Typography variant="body2">
              {govidFile.name}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Typography variant="body2">
            Current Signature CID: {signatureCID ? signatureCID : "Not uploaded"}
          </Typography>
          {signatureCID && (
            <Button variant="text" component="a" href={`https://gateway.pinata.cloud/ipfs/${signatureCID}`} target="_blank" rel="noopener noreferrer">
              View
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" component="label">
            Upload New Signature
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSignatureFile(e.target.files[0]);
                }
              }}
            />
          </Button>
          {signatureFile && (
            <Typography variant="body2">
              {signatureFile.name}
            </Typography>
          )}
        </Box>

        {/* Sticky footer for Save Changes button */}
        <Box sx={{ position: 'sticky', bottom: 0, backgroundColor: 'inherit', pt: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default EditProfileForm;

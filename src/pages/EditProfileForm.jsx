import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from '../components/navbar';
import ContractABI from "../contracts/abi.json";
import NavbarLender from '../components/navbarLender';

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const EditProfileForm = () => {
  // Role: "borrower" or "lender"
  const [role, setRole] = useState(null);

  // Common profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');

  // Credit Score is used for both borrowers and lenders.
  const [creditScore, setCreditScore] = useState('');

  // Lender-only field: Interest Rate
  const [interestRate, setInterestRate] = useState('');

  // Document CIDs (fetched from contract)
  const [govidCID, setGovidCID] = useState('');
  const [signatureCID, setSignatureCID] = useState('');

  // Files (if user uploads a new one)
  const [govidFile, setGovidFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  // Loading state for form submission
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // On mount, fetch the current account's profile
  useEffect(() => {
    async function fetchProfile() {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const account = await signer.getAddress();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, ContractABI, signer);

          // Try borrower mapping first
          try {
            const borrowerData = await contract.borrowers(account);
            // borrowerData.isRegistered is at index 6
            if (borrowerData.isRegistered) {
              setRole('borrower');
              setName(borrowerData.name);
              setPhone(borrowerData.phone);
              setEmail(borrowerData.email);
              setMonthlyIncome(borrowerData.monthlyIncome.toString());
              setCreditScore(borrowerData.creditScore.toString());
              setGovidCID(borrowerData.govidCID);
              setSignatureCID(borrowerData.signatureCID);
              return;
            }
          } catch (error) {
            // Not a borrower
          }

          // Try lender mapping if borrower lookup failed
          try {
            const lenderData = await contract.lenders(account);
            // lenderData.isRegistered is at index 7
            if (lenderData.isRegistered) {
              setRole('lender');
              setName(lenderData.name);
              setPhone(lenderData.phone);
              setEmail(lenderData.email);
              setInterestRate(lenderData.interestRate.toString());
              setMonthlyIncome(lenderData.monthlyIncome.toString());
              setCreditScore(lenderData.creditScore.toString());
              setGovidCID(lenderData.govidCID);
              setSignatureCID(lenderData.signatureCID);
            }
          } catch (error) {
            console.error('Error fetching lender profile:', error);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
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
        // For borrowers: updateBorrowerProfile expects: { name, phone, email, creditScore, monthlyIncome, govidCID, signatureCID }
        const tx = await contract.updateBorrowerProfile({
          name,
          phone,
          email,
          creditScore: parseInt(creditScore) || 0,
          monthlyIncome: parseInt(monthlyIncome) || 0,
          govidCID: newGovidCID,
          signatureCID: newSignatureCID
        });
        await tx.wait();
      } else if (role === 'lender') {
        // For lenders: updateLenderProfile expects: { name, phone, email, interestRate, monthlyIncome, creditScore, govidCID, signatureCID }
        const tx = await contract.updateLenderProfile({
          name,
          phone,
          email,
          interestRate: parseInt(interestRate) || 0,
          monthlyIncome: parseInt(monthlyIncome) || 0,
          creditScore: parseInt(creditScore) || 0,
          govidCID: newGovidCID,
          signatureCID: newSignatureCID
        });
        await tx.wait();
      }
      alert('Profile updated successfully!');
      navigate('/view-profile');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
    setLoading(false);
  }

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
      }}
    >
      {role === 'borrower' ? <Navbar /> : <NavbarLender />}
      <Box
        sx={{
          width: "90%",
          margin: "auto",
          pt: 8,
          pb: 10,
          mb: 10
        }}
      >
        <Paper elevation={3} sx={{ p: 4, maxHeight: '85vh', borderRadius: 5, overflowY: 'auto' }}>
          <Typography variant="h4" gutterBottom>
            Edit Profile
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Name */}
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Name" 
                  variant="outlined" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Email" 
                  variant="outlined" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Phone" 
                  variant="outlined" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>

              {/* Borrower-only: Credit Score (read-only) */}
              {role === 'borrower' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Credit Score"
                    variant="outlined"
                    value={creditScore}
                    onChange={() => {}}
                    disabled
                  />
                </Grid>
              )}

              {/* Lender-only: Interest Rate */}
              {role === 'lender' && (
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Interest Rate" 
                    variant="outlined" 
                    value={interestRate} 
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </Grid>
              )}

              {/* Monthly Income */}
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Monthly Income" 
                  variant="outlined" 
                  value={monthlyIncome} 
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                />
              </Grid>

              {/* Documents */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Documents
                </Typography>
              </Grid>

              {/* Government ID CID */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    Current Government ID CID: {govidCID || "Not uploaded"}
                  </Typography>
                  {govidCID && (
                    <Button
                      variant="text"
                      component="a"
                      href={`https://gateway.pinata.cloud/ipfs/${govidCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Button>
                  )}
                </Box>
              </Grid>

              {/* Government ID Upload */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Signature CID */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Typography variant="body2">
                    Current Signature CID: {signatureCID || "Not uploaded"}
                  </Typography>
                  {signatureCID && (
                    <Button
                      variant="text"
                      component="a"
                      href={`https://gateway.pinata.cloud/ipfs/${signatureCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Button>
                  )}
                </Box>
              </Grid>

              {/* Signature Upload */}
              <Grid item xs={12}>
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
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Save Changes'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default EditProfileForm;

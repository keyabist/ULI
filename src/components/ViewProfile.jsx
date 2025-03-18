// ViewProfile.js
import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Button, Grid, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import contractABI from "../contracts/abi.json";
import NavBar from "./navbar";

const contractAddress = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

const ViewProfile = () => {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);

          // First, check if the user is registered as a borrower.
          const borrowerData = await contract.borrowers(address);
          if (borrowerData[6]) { // index 6 corresponds to isRegistered in Borrower struct.
            const profileData = await contract.getBorrowerProfile(address);
            setProfile({
              role: 'borrower',
              name: profileData[0],
              phone: profileData[1],
              email: profileData[2],
              creditScore: profileData[3],
              monthlyIncome: profileData[4],
              govidCID: profileData[5],
              signatureCID: profileData[6],
              verified: profileData[7]
            });
          } else {
            // Otherwise, check if the user is registered as a lender.
            const lenderData = await contract.lenders(address);
            if (lenderData[6]) { // index 6 corresponds to isRegistered in Lender struct.
              const profileData = await contract.getLenderProfile(address);
              setProfile({
                role: 'lender',
                name: profileData[0],
                phone: profileData[1],
                email: profileData[2],
                interestRate: profileData[3],
                monthlyIncome: profileData[4],
                govidCID: profileData[5],
                signatureCID: profileData[6],
                verified: profileData[7]
              });
            } else {
              console.error("User not registered as either borrower or lender");
            }
          }
        } catch (error) {
          console.error("Error connecting to Ethereum:", error);
        }
      } else {
        console.error("Ethereum wallet not detected");
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <NavBar />
      <Paper elevation={3} style={{ padding: '2rem' }}>
        <Typography variant="h4" gutterBottom>
          Profile ({profile.role})
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Name:</strong> {profile.name}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Email:</strong> {profile.email}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Phone:</strong> {profile.phone}
            </Typography>
          </Grid>
          {profile.role === 'borrower' && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Credit Score:</strong> {profile.creditScore}
              </Typography>
            </Grid>
          )}
          {profile.monthlyIncome !== undefined && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Monthly Income:</strong> {profile.monthlyIncome}
              </Typography>
            </Grid>
          )}
          {profile.role === 'lender' && profile.interestRate !== undefined && (
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                <strong>Interest Rate:</strong> {profile.interestRate}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Government ID Document:</strong>{" "}
              {profile.govidCID ? (
                <MuiLink
                  href={`https://ipfs.io/ipfs/${profile.govidCID}`}
                  target="_blank"
                  rel="noopener"
                >
                  View Document
                </MuiLink>
              ) : (
                "Not Provided"
              )}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              <strong>Signature Document:</strong>{" "}
              {profile.signatureCID ? (
                <MuiLink
                  href={`https://ipfs.io/ipfs/${profile.signatureCID}`}
                  target="_blank"
                  rel="noopener"
                >
                  View Document
                </MuiLink>
              ) : (
                "Not Provided"
              )}
            </Typography>
          </Grid>
          
        </Grid>
        <Grid container spacing={2} style={{ marginTop: '1rem' }}>
  <Grid item xs={6}>
    <Button
      variant="contained"
      fullWidth
      component={Link}
      to={profile.role === 'borrower' ? "/borrowerDashboard" : "/lenderDashboard"}
    >
      Back
    </Button>
  </Grid>
  <Grid item xs={6}>
    <Button variant="contained" color="primary" fullWidth component={Link} to="/edit-profile">
      Edit Profile
    </Button>
  </Grid>
</Grid>

      </Paper>
    </Container>
  );
};

export default ViewProfile;

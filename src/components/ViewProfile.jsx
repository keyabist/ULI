import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Paper, Button, Grid, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import contractABI from "../contracts/abi.json";
import Navbar from "./navbar";
import NavbarLender from "./navbarLender";

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const ViewProfile = () => {
  const { userAddress } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);

          const borrowerData = await contract.borrowers(userAddress);
          if (borrowerData[6]) {
            const profileData = await contract.getBorrowerProfile(userAddress);
            setProfile({
              role: 'borrower',
              name: profileData[1],
              phone: profileData[2],
              email: profileData[3],
              creditScore: profileData[4].toString(),
              monthlyIncome: profileData[5].toString(),
              govidCID: profileData[7],
              signatureCID: profileData[8]
            });
          } else {
            const lenderData = await contract.lenders(userAddress);
            if (lenderData[7]) {
              const profileData = await contract.getLenderProfile(userAddress);
              setProfile({
                role: 'lender',
                name: profileData[1],
                phone: profileData[2],
                email: profileData[3],
                interestRate: profileData[4].toString(),
                monthlyIncome: profileData[5].toString(),
                creditScore: profileData[6].toString(),
                govidCID: profileData[8],
                signatureCID: profileData[9]
              });
            } else {
              console.error("User not registered as either borrower or lender");
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        console.error("Ethereum wallet not detected");
      }
    };

    fetchProfile();
  }, [userAddress]);

  if (!profile) {
    return <Typography>Loading profile...</Typography>;
  }

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem', backgroundColor: '#1a1a1a', padding: '2rem', borderRadius: 20 }}>
      {profile.role === 'borrower' ? <Navbar /> : <NavbarLender />}
      <Paper elevation={3} style={{ padding: '2rem', borderRadius: 20, backgroundColor: '#333', color: 'white' }}>
        <Typography variant="h4" gutterBottom style={{ color: '#f0b90b' }}>
          Profile ({profile.role})
        </Typography>
        <Grid container spacing={2} direction="column" alignItems="flex-start">
          <Grid item>
            <Typography variant="subtitle1"><strong>Name:</strong> {profile.name}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1"><strong>Email:</strong> {profile.email}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1"><strong>Phone:</strong> {profile.phone}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1"><strong>Credit Score:</strong> {profile.creditScore}</Typography>
          </Grid>
          {profile.monthlyIncome !== undefined && (
            <Grid item>
              <Typography variant="subtitle1"><strong>Monthly Income:</strong> {profile.monthlyIncome}</Typography>
            </Grid>
          )}
          {profile.role === 'lender' && profile.interestRate !== undefined && (
            <Grid item>
              <Typography variant="subtitle1"><strong>Interest Rate:</strong> {profile.interestRate}</Typography>
            </Grid>
          )}
          <Grid item>
            <Typography variant="subtitle1">
              <strong>Government ID Document:</strong>{" "}
              {profile.govidCID ? (
                <MuiLink href={`https://ipfs.io/ipfs/${profile.govidCID}`} target="_blank" rel="noopener" style={{ color: "#f0b90b" }}>
                  View Document
                </MuiLink>
              ) : (
                "Not Provided"
              )}
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="subtitle1">
              <strong>Signature Document:</strong>{" "}
              {profile.signatureCID ? (
                <MuiLink href={`https://ipfs.io/ipfs/${profile.signatureCID}`} target="_blank" rel="noopener" style={{ color: "#f0b90b" }}>
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
            <Button variant="contained" fullWidth component={Link} to={profile.role === 'borrower' ? "/borrowerDashboard" : "/lenderDashboard"}>
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

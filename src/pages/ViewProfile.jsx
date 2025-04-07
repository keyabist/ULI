import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import contractABI from "../contracts/abi.json";
import "./ViewProfile.css";
import Sidebar from '../components/Siderbar';

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const ViewProfile = () => {
  const { userAddress } = useParams();
  const [profile, setProfile] = useState(null);
  const [currentUserAddress, setCurrentUserAddress] = useState(null);

  // For toggling inline document previews
  const [showGovDoc, setShowGovDoc] = useState(false);
  const [showSignDoc, setShowSignDoc] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (window.ethereum) {
        try {
          // Get the current user's address
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setCurrentUserAddress(accounts[0].toLowerCase());
          }
        } catch (error) {
          console.error("Error getting current user:", error);
        }
      }
    };

    const fetchProfile = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);

          // Check if user is a borrower
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
            // Otherwise, check if user is a lender
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

    fetchCurrentUser();
    fetchProfile();
  }, [userAddress]);

  if (!profile) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
        Loading profile...
      </div>
    );
  }

  // Convert credit score to a number and clamp between 0 and 100
  const creditScoreValue = parseInt(profile.creditScore) || 0;
  const creditScorePercent = Math.min(Math.max(creditScoreValue, 0), 100);
  
  // Check if current user is the profile owner
  const isProfileOwner = currentUserAddress && userAddress.toLowerCase() === currentUserAddress;

  return (
    <div className="profile-page">
      <Sidebar />
      {/* Outer container */}
      <div className="profile-container">
        <div className="profile-title">
          <h2>Profile</h2>
        </div>

        <div className="boxes-row">
          {/* Left box: Info */}
          <div className="info-box">
            <div className="info-row">
              <span className="info-label">Full Name:</span>
              <span className="info-value">{profile.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{profile.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{profile.phone}</span>
            </div>
            {profile.monthlyIncome && (
              <div className="info-row">
                <span className="info-label">Monthly Income:</span>
                <span className="info-value">{profile.monthlyIncome}</span>
              </div>
            )}
            {/* Lender-specific interest rate */}
            {profile.role === 'lender' && profile.interestRate && (
              <div className="info-row">
                <span className="info-label">Interest Rate:</span>
                <span className="info-value">{profile.interestRate}</span>
              </div>
            )}

            {/* Credit Score with hoverable progress bar */}
            <div className="info-row">
              <span className="info-label">Credit Score:</span>
              <span className="info-value">{profile.creditScore}</span>
            </div>
            <div 
              className="progress-bar-wrapper" 
              title={`Credit Score: ${profile.creditScore}`}
            >
              <div 
                className="progress-bar-fill" 
                style={{ width: `${creditScorePercent}%` }}
              ></div>
            </div>
          </div>

          {/* Right box: Documents */}
          <div className="docs-box">
            {/* Government ID Document */}
            <div className="doc-row">
              <span className="doc-label">Government ID Document:</span>
              {profile.govidCID ? (
                <button
                  className="doc-link"
                  onClick={() => setShowGovDoc(!showGovDoc)}
                >
                  {showGovDoc ? "Hide Document" : "View Document"}
                </button>
              ) : (
                <span className="doc-not-provided">Not Provided</span>
              )}
            </div>
            {/* Inline preview if showGovDoc is true (as an image) */}
            {showGovDoc && profile.govidCID && (
              <div className="doc-preview">
                <img
                  src={`https://ipfs.io/ipfs/${profile.govidCID}`}
                  alt="Government ID"
                  className="doc-image"
                />
              </div>
            )}

            {/* Signature Document */}
            <div className="doc-row">
              <span className="doc-label">Signature Document:</span>
              {profile.signatureCID ? (
                <button
                  className="doc-link"
                  onClick={() => setShowSignDoc(!showSignDoc)}
                >
                  {showSignDoc ? "Hide Document" : "View Document"}
                </button>
              ) : (
                <span className="doc-not-provided">Not Provided</span>
              )}
            </div>
            {/* Inline preview if showSignDoc is true (as an image) */}
            {showSignDoc && profile.signatureCID && (
              <div className="doc-preview">
                <img
                  src={`https://ipfs.io/ipfs/${profile.signatureCID}`}
                  alt="Signature Document"
                  className="doc-image"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Edit Profile Button - only shown to profile owner */}
        {isProfileOwner && (
          <div className="edit-profile-btn-row">
            <Link to="/edit-profile" className="edit-profile-btn">
              Edit Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;
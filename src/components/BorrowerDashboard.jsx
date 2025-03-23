import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import NavBar from "./navbar";
import './BorrowerDashboard.css';

const contractAddress = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

const BorrowerDashboard = () => {
  const [lenders, setLenders] = useState([]);
  const [filteredLenders, setFilteredLenders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState([]);
  const [ongoingLoans, setOngoingLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const navigate = useNavigate();

  const initializeWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to use this application");
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please connect your wallet.");
      }

      const connectedAccount = accounts[0];
      setAccount(connectedAccount);

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contractInstance);

      return contractInstance;
    } catch (error) {
      console.error("Error initializing wallet:", error);
      setError(error.message || "Failed to connect wallet");
      return null;
    }
  };

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const contractInstance = await initializeWallet();
      if (!contractInstance) return;

      // Check if user is registered as borrower
      const borrowerData = await contractInstance.borrowers(account);
      if (!borrowerData.isRegistered) {
        navigate("/registrationForm");
        return;
      }

      // Fetch all data in parallel
      const [lenderAddresses, nextLoanIdBN] = await Promise.all([
        contractInstance.getAllLenders(),
        contractInstance.nextLoanId()
      ]);

      const nextLoanId = Number(nextLoanIdBN);

      // Fetch lenders
      const lenderDetails = await Promise.all(
        lenderAddresses.map(async (address) => {
          try {
            const lender = await contractInstance.lenders(address);
            if (lender.isRegistered) {
              return {
                walletAddress: address,
                name: lender.name,
                email: lender.email,
                phone: lender.phone,
                interestRate: parseFloat(lender.interestRate.toString()),
                maxLoanAmount: lender.maxLoanAmount,
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching lender ${address}:`, error);
            return null;
          }
        })
      );

      const filtered = lenderDetails.filter(Boolean);
      filtered.sort((a, b) => a.interestRate - b.interestRate);
      setLenders(filtered);
      setFilteredLenders(filtered);

      // Fetch requests and loans
      const [borrowerRequests, borrowerLoans] = await Promise.all([
        fetchRequests(contractInstance, account, nextLoanId),
        fetchOngoingLoans(contractInstance, account, nextLoanId)
      ]);

      setRequests(borrowerRequests);
      setOngoingLoans(borrowerLoans);
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      setError(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeDashboard();

    // Set up event listeners
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (newAccounts) => {
        if (newAccounts.length > 0) {
          setAccount(newAccounts[0]);
          await initializeDashboard();
        } else {
          setAccount(null);
          navigate("/");
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    // Cleanup event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => { });
        window.ethereum.removeListener("chainChanged", () => { });
      }
    };
  }, [navigate]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, lenders]);

  const fetchRequests = async (contractInstance, userAddress, nextLoanId) => {
    const requests = [];
    for (let i = 1; i < nextLoanId; i++) {
      try {
        const loan = await contractInstance.loans(i);
        if (
          loan.borrower.toLowerCase() === userAddress.toLowerCase() &&
          Number(loan.status) === 0
        ) {
          requests.push({
            id: loan.loanId.toString(),
            lender: loan.lender,
            amount: loan.amount,
            interestRate: parseFloat(loan.interestRate.toString()),
            duration: loan.repaymentPeriod.toString(),
            status: "Pending",
          });
        }
      } catch (error) {
        console.error(`Error fetching loan ${i}:`, error);
        continue;
      }
    }
    return requests;
  };

  const fetchOngoingLoans = async (contractInstance, userAddress, nextLoanId) => {
    const loans = [];
    for (let i = 1; i < nextLoanId; i++) {
      try {
        const loan = await contractInstance.loans(i);
        if (
          loan.borrower.toLowerCase() === userAddress.toLowerCase() &&
          Number(loan.status) === 1
        ) {
          loans.push({
            id: loan.loanId.toString(),
            lender: loan.lender,
            amount: loan.amount,
            interestRate: parseFloat(loan.interestRate.toString()),
            duration: loan.repaymentPeriod.toString(),
            startTime: loan.startTime.toString(),
            status: "Active",
          });
        }
      } catch (error) {
        console.error(`Error fetching loan ${i}:`, error);
        continue;
      }
    }
    return loans;
  };

  const handleRequestLoan = (lender) => {
    navigate("/requestForm", {
      state: {
        lender: {
          address: lender.walletAddress,
          interestRate: lender.interestRate,
          maxLoanAmount: lender.maxLoanAmount,
          name: lender.name,
          email: lender.email
        }
      }
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredLenders(lenders);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = lenders.filter((lender) =>
      lender.name.toLowerCase().includes(query) ||
      lender.email.toLowerCase().includes(query) ||
      lender.phone.toLowerCase().includes(query)
    );
    setFilteredLenders(filtered);
  };

  if (!account) {
    return (
      <>
        <NavBar />
        <div className="dashboard-container">
          <div className="error-state">
            <p>Please connect your wallet to continue</p>
            <button onClick={() => window.location.reload()}>Connect Wallet</button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="dashboard-container">
          <div className="loading-state">
            <p>Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="dashboard-container">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="dashboard-container">
        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Available Lenders</h3>
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search lenders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="lender-list">
              {filteredLenders.length > 0 ? (
                filteredLenders.map((lender) => (
                  <div key={lender.walletAddress} className="lender-card">
                    <div className="lender-info">
                      <h4>{lender.name}</h4>
                      <p>
                        <span>Email:</span> {lender.email}
                      </p>
                      <p>
                        <span>Phone:</span> {lender.phone}
                      </p>
                      <p>
                        <span>Interest Rate:</span> {lender.interestRate}%
                      </p>
                      <p>
                        <span>Max Loan Amount:</span>{" "}
                        {ethers.formatEther(lender.maxLoanAmount)} ETH
                      </p>
                    </div>
                    <button
                      className="request-button"
                      onClick={() => handleRequestLoan(lender)}
                    >
                      Request Loan
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No lenders found</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h3>Your Loan Requests</h3>
            </div>
            <div className="loan-list">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <div key={request.id} className="loan-card">
                    <div className="loan-card-header">
                      <div className="loan-card-title">Loan Request #{request.id}</div>
                      <div className="loan-card-status status-pending">
                        {request.status}
                      </div>
                    </div>
                    <div className="loan-info">
                      <div className="loan-info-item">
                        <span className="loan-info-label">Amount</span>
                        <span className="loan-info-value">
                          {ethers.formatEther(request.amount)} ETH
                        </span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-info-label">Interest Rate</span>
                        <span className="loan-info-value">{request.interestRate}%</span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-info-label">Duration</span>
                        <span className="loan-info-value">{request.duration} days</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No pending loan requests</p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h3>Active Loans</h3>
            </div>
            <div className="loan-list">
              {ongoingLoans.length > 0 ? (
                ongoingLoans.map((loan) => (
                  <div key={loan.id} className="loan-card">
                    <div className="loan-card-header">
                      <div className="loan-card-title">Loan #{loan.id}</div>
                      <div className="loan-card-status status-active">
                        {loan.status}
                      </div>
                    </div>
                    <div className="loan-info">
                      <div className="loan-info-item">
                        <span className="loan-info-label">Amount</span>
                        <span className="loan-info-value">
                          {ethers.formatEther(loan.amount)} ETH
                        </span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-info-label">Interest Rate</span>
                        <span className="loan-info-value">{loan.interestRate}%</span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-info-label">Duration</span>
                        <span className="loan-info-value">{loan.duration} days</span>
                      </div>
                      <div className="loan-info-item">
                        <span className="loan-info-label">Start Time</span>
                        <span className="loan-info-value">
                          {new Date(Number(loan.startTime) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No active loans</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BorrowerDashboard;

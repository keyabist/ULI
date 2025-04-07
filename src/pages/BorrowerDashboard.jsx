import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import NavBar from "../components/navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Toolbar,
} from '@mui/material';
import "../styles/BorrowerDashboard.css";
import Sidebar from "../components/Siderbar";
import CustomLoader from "../components/CustomLoader"; // <-- import this

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const BorrowerDashboard = ({ account }) => {
  const [lenders, setLenders] = useState([]);
  const [filteredLenders, setFilteredLenders] = useState([]);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [ongoingLoans, setOngoingLoans] = useState([]);
  const [completedLoans, setCompletedLoans] = useState([]);
  const [requestsHistory, setRequestsHistory] = useState([]);
  const [selectedLender, setSelectedLender] = useState(null);
  const [loading, setLoading] = useState(true); // <-- NEW: Track loading state

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLenders(),
        fetchRequests(),
        fetchOngoingLoans(),
        fetchCompletedLoans(),
        fetchRequestsHistory(),
      ]);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    handleSearch();
  }, [search, lenders]);

  const fetchLenders = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const lenderAddresses = await contract.getAllLenders();
      const lenderDetails = await Promise.all(
        lenderAddresses.map(async (address) => {
          const lender = await contract.lenders(address);
          if (lender.isRegistered) {
            return {
              walletAddress: address,
              name: lender.name,
              email: lender.email,
              phone: lender.phone,
              interestRate: parseFloat(lender.interestRate.toString()),
              creditScore: Number(lender.creditScore),
            };
          }
          return null;
        })
      );
      const filtered = lenderDetails.filter(Boolean);
      filtered.sort((a, b) => a.interestRate - b.interestRate);
      setLenders(filtered);
      setFilteredLenders(filtered);
    } catch (error) {
      console.error("Error fetching lenders:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const nextLoanId = Number(await contract.nextLoanId());
      const borrowerRequests = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        if (
          loan.borrower.toLowerCase() === userAddress.toLowerCase() &&
          Number(loan.status) === 0
        ) {
          borrowerRequests.push({
            id: loan.loanId.toString(),
            lender: loan.lender,
            isApproved: false,
          });
        }
      }
      setRequests(borrowerRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchOngoingLoans = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const nextLoanId = Number(await contract.nextLoanId());
      const borrowerLoans = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        if (
          loan.borrower.toLowerCase() === userAddress.toLowerCase() &&
          Number(loan.status) === 1
        ) {
          borrowerLoans.push({
            id: loan.loanId.toString(),
            amount: ethers.formatEther(loan.amount) + " ETH",
            interestRate: loan.interestRate.toString() + " %",
            duration: loan.repaymentPeriod.toString() + " months",
          });
        }
      }
      setOngoingLoans(borrowerLoans);
    } catch (error) {
      console.error("Error fetching ongoing loans:", error);
    }
  };

  const fetchCompletedLoans = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = (await signer.getAddress()).toLowerCase();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const nextLoanId = Number(await contract.nextLoanId());
      const completed = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        if (
          loan.borrower.toLowerCase() === userAddress &&
          loan.status.toString() === "3"
        ) {
          completed.push(loan);
        }
      }
      setCompletedLoans(completed);
    } catch (error) {
      console.error("Error fetching completed loans:", error);
    }
  };

  const fetchRequestsHistory = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = (await signer.getAddress()).toLowerCase();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const nextLoanId = Number(await contract.nextLoanId());
      const history = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        if (
          loan.borrower.toLowerCase() === userAddress &&
          loan.status.toString() !== "3"
        ) {
          history.push(loan);
        }
      }
      setRequestsHistory(history);
    } catch (error) {
      console.error("Error fetching requests history:", error);
    }
  };

  const handleSearch = () => {
    const lowerSearch = search.toLowerCase();
    const filtered = lenders.filter(
      (lender) =>
        lender.name.toLowerCase().includes(lowerSearch) ||
        lender.interestRate.toString().includes(lowerSearch)
    );
    setFilteredLenders(filtered);
  };

  const handleSelectLender = (lender) => setSelectedLender(lender);

  const handleRequestLoan = () => {
    if (!selectedLender) {
      alert("Please select a lender first!");
      return;
    }
    navigate("/requestForm", { state: { lender: selectedLender } });
  };

  return (
    <>
      <Sidebar />
      <div className="borrower-dashboard">
        <Toolbar />

        {/* LEFT SECTION */}
        <div className="left-section">
          <h3>Available Lenders</h3>
          <input
            type="text"
            placeholder="Search by Name or Interest Rate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
          <div className="lenders-list">
            {filteredLenders.length === 0 ? (
              <p>No Lenders Found</p>
            ) : (
              filteredLenders.map((lender, index) => {
                const isSelected = selectedLender?.walletAddress === lender.walletAddress;
                return (
                  <div
                    key={index}
                    className={`lender-box ${isSelected ? "selected-lender" : ""}`}
                    onClick={() => handleSelectLender(lender)}
                  >
                    <div className={`select-box ${isSelected ? "selected" : ""}`}></div>
                    <div className="lender-info">
                      <p>Name: {lender.name}</p>
                      <p>Email: {lender.email}</p>
                      <p>Phone: {lender.phone}</p>
                      <p>Interest Rate: {lender.interestRate}%</p>
                      <p>Credit Score: {lender.creditScore}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button className="request-loan-button" onClick={handleRequestLoan}>
            Request Loan
          </button>
        </div>

        {/* RIGHT SECTION */}
        <div className="right-section">
          {loading ? (
            <CustomLoader />
          ) : (
            <>
              {/* Top: Generated Requests */}
              <div className="right-top">
                <h3>Generated Requests</h3>
                <div className="list-container requests-list">
                  {requests.length === 0 ? (
                    <p>No Requests Found</p>
                  ) : (
                    requests.map((loan, index) => (
                      <div
                        key={index}
                        className="lender-box"
                        onClick={() => navigate(`/loanStatus/${loan.id}`)}
                      >
                        <p>Loan ID: {loan.id}</p>
                        <p>Lender: {loan.lender}</p>
                        <p>Status: Pending</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Middle: Ongoing Loans */}
              <div className="right-middle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3>Ongoing Loans</h3>
                <div className="list-container ongoing-list" style={{ width: '80%' }}>
                  {ongoingLoans.length === 0 ? (
                    <p>No Loans Found</p>
                  ) : (
                    <TableContainer component={Paper} sx={{ backgroundColor: '#111', borderRadius: '12px' }}>
                      <Table sx={{ minWidth: 400 }} aria-label="ongoing loans table">
                        <TableHead>
                          <TableRow>
                            {['Loan ID', 'Amount', 'Interest', 'Duration'].map((heading, idx) => (
                              <TableCell
                                key={idx}
                                sx={{
                                  color: '#0f0',
                                  border: '2px solid #0f0',
                                  textAlign: 'center',
                                  boxShadow: '0 0 8px #0f0',
                                }}
                              >
                                {heading}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ongoingLoans.map((loan, index) => (
                            <TableRow
                              key={index}
                              hover
                              sx={{ cursor: 'pointer' }}
                              onClick={() => navigate(`/loanStatus/${loan.id}`)}
                            >
                              <TableCell sx={{ color: '#0f0', border: '2px solid #0f0', textAlign: 'center' }}>{loan.id}</TableCell>
                              <TableCell sx={{ color: '#0f0', border: '2px solid #0f0', textAlign: 'center' }}>{loan.amount}</TableCell>
                              <TableCell sx={{ color: '#0f0', border: '2px solid #0f0', textAlign: 'center' }}>{loan.interestRate}</TableCell>
                              <TableCell sx={{ color: '#0f0', border: '2px solid #0f0', textAlign: 'center' }}>{loan.duration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="right-bottom">
                <div
                  className="dashboard-button"
                  onClick={() => navigate("/requestStatusPage")}
                >
                  <div className="icon">
                    <i className="fa fa-history"></i>
                  </div>
                  <div className="info">
                    <h4>REQUESTS HISTORY</h4>
                    <p>{requestsHistory.length} requests</p>
                  </div>
                </div>
                <div
                  className="dashboard-button"
                  onClick={() => navigate("/completedLoansPage")}
                >
                  <div className="icon">
                    <i className="fa fa-check-circle"></i>
                  </div>
                  <div className="info">
                    <h4>COMPLETED LOANS</h4>
                    <p>{completedLoans.length} loans</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BorrowerDashboard;
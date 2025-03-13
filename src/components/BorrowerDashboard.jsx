import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import NavBar from "./navbar"; 
import { contractConfig } from '../contractConfig';

const contractAddress = "0x4d20B7131ac08bba92b885188d0980d2C2dea68f";

const BorrowerDashboard = ({ account }) => {
  const [lenders, setLenders] = useState([]);
  const [filteredLenders, setFilteredLenders] = useState([]);
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState([]);
  const [ongoingLoans, setOngoingLoans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLenders();
    fetchRequests();
    fetchOngoingLoans();
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

  // Replace the non-existent getRequestsByBorrower with a loop that fetches all loans and filters for the current borrower with status Pending (0)
  const fetchRequests = async () => {
    try {
       const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              const userAddress = await signer.getAddress(); 
              const contract = new ethers.Contract(
                contractConfig.contractAddress,
                contractConfig.abi,
                signer
              );

      const nextLoanIdBN = await contract.nextLoanId();
      const nextLoanId = Number(nextLoanIdBN); // Use Number() conversion
  
      let borrowerRequests = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        if (
          loan.borrower === userAddress &&
          Number(loan.status) === 0  // Convert status BigInt to number
        ) {
          borrowerRequests.push({
            id: loan.loanId.toString(),
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
              const contract = new ethers.Contract(
                contractConfig.contractAddress,
                contractConfig.abi,
                signer
              );
      const nextLoanIdBN = await contract.nextLoanId();
      const nextLoanId = Number(nextLoanIdBN); // Convert BigInt to Number
  
      let borrowerLoans = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        if (
          loan.borrower === userAddress &&
          Number(loan.status) === 1
        ) {
          borrowerLoans.push({
            amount: ethers.formatEther(loan.amount) + " ETH",
            interestRate: loan.interestRate.toString() + " %",
            duration: loan.repaymentPeriod.toString() + " months",
          });
        }
      }
      setOngoingLoans(borrowerLoans);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };
  
  const handleRequest = (lender) => {
    navigate("/requestForm", { state: { lender } });
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

  const dashboardStyle = {
    display: "grid",
    gridTemplateColumns: "1.2fr 2fr",
    gap: "40px",
    padding: "40px",
    paddingTop: "100px",
    backgroundColor: "#1A3A6A",
    color: "white",
    minHeight: "100vh",
    overflowY: "auto",
  };

  const leftSectionStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    border: "3px solid #00d1b2",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#27374D",
    overflowY: "auto",
    maxHeight: "80vh",
  };

  const rightSectionStyle = {
    display: "grid",
    gridTemplateRows: "1fr 1fr",
    gap: "20px",
    border: "3px solid #00d1b2",
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#27374D",
    overflowY: "auto",
    maxHeight: "80vh",
  };

  const lenderBoxStyle = {
    padding: "15px",
    border: "2px solid #00d1b2",
    backgroundColor: "#394867",
    borderRadius: "10px",
    marginBottom: "20px",
    color: "white",
  };

  const buttonStyle = {
    padding: "10px 14px",
    backgroundColor: "#00d1b2",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  };

  const searchBarStyle = {
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "5px",
    border: "none",
    outline: "none",
    width: "100%",
  };

  return (
    <>
      <NavBar />
      <div style={dashboardStyle}>
        <div style={leftSectionStyle}>
          <h3>Available Lenders</h3>
          <input
            type="text"
            placeholder="Search by Name or Interest Rate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchBarStyle}
          />
          {filteredLenders.length === 0 ? (
            <p>No Lenders Found</p>
          ) : (
            filteredLenders.map((lender, index) => (
              <div key={index} style={lenderBoxStyle} >
                <p>Name: {lender.name}</p>
                <p>Email: {lender.email}</p>
                <p>Phone: {lender.phone}</p>
                <p>Interest Rate: {lender.interestRate}%</p>
                <button style={buttonStyle} onClick={() => handleRequest(lender)}>
                  Request Loan
                </button>
              </div>
            ))
          )}
        </div>

        <div style={rightSectionStyle}>
          <div>
            <h3>Generated Requests</h3>
            {requests.length === 0 ? (
              <p>No Requests Found</p>
            ) : (
              requests.map((request, index) => (
                <div key={index} style={lenderBoxStyle} onClick={() => navigate(`/loanstatus`, { state: { loanId: request.id } })}>
                  <p>Request ID: {request.id}</p>
                  <p>Status: {request.isApproved ? "Approved ✅" : "Pending 🔄"}</p>
                </div>
              ))
            )}
          </div>

          <div>
            <h3>Ongoing Loans</h3>
            {ongoingLoans.length === 0 ? (
              <p>No Ongoing Loans</p>
            ) : (
              ongoingLoans.map((loan, index) => (
                <div key={index} style={lenderBoxStyle} onClick={() => navigate(`/loanstatus`, { state: { loanId: loan.loanId } })}>
                  <p>Amount: {loan.amount}</p>
                  <p>Interest: {loan.interestRate}</p>
                  <p>Duration: {loan.duration}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BorrowerDashboard;

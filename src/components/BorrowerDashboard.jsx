import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../contracts/abi.json";
import NavBar from "./navbar";

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

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

  // Fetch all registered lenders using getAllLenders()
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
      // Sort by interest rate (ascending)
      filtered.sort((a, b) => a.interestRate - b.interestRate);
      setLenders(filtered);
      setFilteredLenders(filtered);
    } catch (error) {
      console.error("Error fetching lenders:", error);
    }
  };

  // Fetch loan requests (pending) sent by the borrower
  const fetchRequests = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const nextLoanIdBN = await contract.nextLoanId();
      const nextLoanId = Number(nextLoanIdBN);

      let borrowerRequests = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        // Check if the loan was requested by the current user and is Pending (status = 0)
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

  // Fetch ongoing (approved) loans for the borrower
  const fetchOngoingLoans = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const nextLoanIdBN = await contract.nextLoanId();
      const nextLoanId = Number(nextLoanIdBN);

      let borrowerLoans = [];
      for (let i = 1; i < nextLoanId; i++) {
        const loan = await contract.loans(i);
        // Check if the loan is from this borrower and has been approved (status = 1)
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

  // Styles remain unchanged
  const dashboardStyle = {
    display: "grid",
    gridTemplateColumns: "1.2fr 2fr",
    gap: "40px",
    padding: "40px",
    paddingTop: "100px",
    backgroundColor: "#1A3A6A",
    color: "white",
    height: "100vh",
    width: "100vw",
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
    maxHeight: "80vh",
    overflowY: "auto",
  };

  const listContainerStyle = {
    overflowY: "auto",
    maxHeight: "35vh",
  };

  const lenderBoxStyle = {
    padding: "15px",
    border: "2px solid #00d1b2",
    backgroundColor: "#394867",
    borderRadius: "10px",
    marginBottom: "10px",
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
            style={{ padding: "10px", borderRadius: "5px", width: "100%" }}
          />
          <div>
            {filteredLenders.length === 0 ? (
              <p>No Lenders Found</p>
            ) : (
              filteredLenders.map((lender, index) => (
                <div key={index} style={lenderBoxStyle}>
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
        </div>

        <div style={rightSectionStyle}>
          <div style={listContainerStyle}>
            <h3>Generated Requests</h3>
            {requests.length === 0 ? (
              <p>No Requests Found</p>
            ) : (
              requests.map((loan, index) => (
                <div
                  key={index}
                  style={lenderBoxStyle}
                  onClick={() => navigate(`/loanStatus/${loan.id}`)}
                >
                  <p>Loan ID: {loan.id}</p>
                  <p>Lender Address: {loan.lender}</p>
                  <p>Status: Pending</p>
                </div>
              ))
            )}
          </div>

          <div style={listContainerStyle}>
            <h3>Ongoing Loans</h3>
            {ongoingLoans.length === 0 ? (
              <p>No Loans Found</p>
            ) : (
              ongoingLoans.map((loan, index) => (
                <div
                  key={index}
                  style={lenderBoxStyle}
                  onClick={() => navigate(`/loanStatus/${loan.id}`)}
                >
                  <p>Loan ID: {loan.id}</p>
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

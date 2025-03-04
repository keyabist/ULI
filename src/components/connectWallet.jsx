import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";

const contractAddress = "0x6b82A39f2f184A069D999D24025Cf656d0d8E5cf"; 

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState("No Wallet Connected");
  const [contractMessage, setContractMessage] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const role = params.get("role"); // fallback role from URL, if any

  const fetchBalance = async (provider, userAccount) => {
    try {
      const walletBalance = await provider.getBalance(userAccount);
      setBalance(ethers.formatEther(walletBalance));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    }
  };

  // This function is optional—remove it if your contract doesn’t provide getMessage.
  const fetchContractMessage = async (signer) => {
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      if (contract.getMessage) { // ensure the function exists
        const message = await contract.getMessage();
        setContractMessage(message);
      } else {
        setContractMessage("No message function");
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setContractMessage("Error fetching data");
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed! Please install MetaMask and try again.");
      setStatus("MetaMask Not Installed");
      return;
    }
    try {
      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const connectedAccount = accounts[0];
      
      setAccount(connectedAccount);
      setStatus("Wallet Connected");

      // Fetch balance and contract message as in your base logic
      await fetchBalance(provider, connectedAccount);
      await fetchContractMessage(signer);

      // Now query the contract for registration status:
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const borrowerData = await contract.borrowers(connectedAccount);
      const lenderData = await contract.lenders(connectedAccount);

      console.log("Borrower Data:", borrowerData);
      console.log("Lender Data:", lenderData);

      // Navigate based on registration status:
      if (borrowerData.isRegistered) {
        navigate("/borrowerDashboard");
      } else if (lenderData.isRegistered) {
        navigate("/lenderDashboard");
      } else {
        navigate("/registrationForm");
      }
      
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setStatus("Error connecting to Wallet");
    }
  }, [navigate, role]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
        setStatus(accounts[0] ? "Wallet Connected" : "No Wallet Connected");
      });
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
  }, []);

  return (
    <div className="wallet-container">
      <h1>MetaMask Wallet Connection</h1>
      <p className={`status ${status.replace(/ /g, "-").toLowerCase()}`}>{status}</p>
      <button className="connect-button" onClick={connectWallet}>
        {account ? "Reconnect Wallet" : "Connect Wallet"}
      </button>
      {account && (
        <div className="wallet-info">
          <p>Wallet Address: {account}</p>
          <p>Balance: {balance ? `${balance} ETH` : "Fetching balance..."}</p>
          <p>Contract Message: {contractMessage || "Fetching data..."}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;

import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";

// Import the CSS file
import "../styles/WalletConnect.css";
import ParallaxBackground from "../components/ParallaxBG";
import ParallaxBackground from "../components/ParallaxBG";

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

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

  const fetchContractMessage = async (signer) => {
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      if (contract.getMessage) {
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const connectedAccount = accounts[0];

      setAccount(connectedAccount);
      setStatus("Wallet Connected");

      await fetchBalance(provider, connectedAccount);
      await fetchContractMessage(signer);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const borrowerData = await contract.borrowers(connectedAccount);
      const lenderData = await contract.lenders(connectedAccount);

      console.log("Borrower Data:", borrowerData);
      console.log("Lender Data:", lenderData);

      navigate('/home');
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setStatus("Error connecting to Wallet");
    }
  }, [navigate, role]);

  const logout = () => {
    setAccount(null);
    setBalance(null);
    setStatus("No Wallet Connected");
    navigate("/");
  };

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
    <div className="wallet-hero" style={{position: "relative", zIndex: 1}}>
      <ParallaxBackground />
      <div className="wallet-content" style={{position: "relative", zIndex: 2}}>
        <h1>UNIFIED LENDING INTERFACE</h1>

        {/* Status text */}
        <p className="status-text">{status}</p>

        {!account ? (
          <button className="connect-button" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <div>
            <p>Wallet Address: {account}</p>
            <p>Balance: {balance ? `${balance} ETH` : "Fetching balance..."}</p>
            <p>Contract Message: {contractMessage || "Fetching data..."}</p>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;

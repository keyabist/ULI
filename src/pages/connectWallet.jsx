import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";
import contractABI from "../contracts/abi.json";

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

  // Optionally fetch a message from the contract
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
      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const connectedAccount = accounts[0];

      setAccount(connectedAccount);
      setStatus("Wallet Connected");

      // Fetch balance and contract message
      await fetchBalance(provider, connectedAccount);
      await fetchContractMessage(signer);

      // Query contract for registration status
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const borrowerData = await contract.borrowers(connectedAccount);
      const lenderData = await contract.lenders(connectedAccount);

      console.log("Borrower Data:", borrowerData);
      console.log("Lender Data:", lenderData);

      // Redirect based on registration status
      if (borrowerData.isRegistered) {
        navigate("/borrowerDashboard");
      } else if (lenderData.isRegistered && lenderData.lenderAddress !== ethers.ZeroAddress) {
        navigate("/lenderDashboard");
      } else {
        navigate("/registrationForm");
      }

    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setStatus("Error connecting to Wallet");
    }
  }, [navigate, role]);

  // Logout clears wallet state and routes back to connect wallet page
  const logout = () => {
    setAccount(null);
    setBalance(null);
    setStatus("No Wallet Connected");
    navigate("/"); // Reroute to the connect wallet page
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
    <div className="wallet-container">
      <h1>MetaMask Wallet Connection</h1>
      <p className={`status ${status.replace(/ /g, "-").toLowerCase()}`}>{status}</p>
      {!account ? (
        <button className="connect-button" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <div>
          <div className="wallet-info">
            <p>Wallet Address: {account}</p>
            <p>Balance: {balance ? `${balance} ETH` : "Fetching balance..."}</p>
            <p>Contract Message: {contractMessage || "Fetching data..."}</p>
          </div>
          <button
            onClick={logout}
            className="logout-button bg-red-500 text-white p-2 rounded mt-4"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;

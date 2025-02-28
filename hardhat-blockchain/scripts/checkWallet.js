require("dotenv").config(); // Load environment variables
const { ethers } = require("ethers"); // Ensure correct import

// Debug: Check if environment variables are loaded
console.log("RPC URL:", process.env.SEPOLIA_RPC_URL);
console.log("Private Key Loaded:", process.env.PRIVATE_KEY ? "Yes" : "No");

// Create provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function checkBalance() {
  try {
    console.log("Wallet Address:", wallet.address);

    const balance = await provider.getBalance(wallet.address); // ✅ Correct way
    console.log("Balance:", ethers.formatEther(balance), "ETH"); // ✅ Correct formatting
  } catch (error) {
    console.error("Error fetching balance:", error);
  }
}

checkBalance();

const { ethers } = require("ethers");

// Load your private key from environment variables or paste it directly
const PRIVATE_KEY = process.env.PRIVATE_KEY;  // Replace with your actual private key

const wallet = new ethers.Wallet(PRIVATE_KEY);
console.log("Wallet Address:", wallet.address);

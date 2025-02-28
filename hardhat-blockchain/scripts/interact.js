const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x966e13C18C818C779bdBa1C875830c44826c5b97"; // Replace with your deployed address
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL); // Use Alchemy or Infura
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Replace with your private key

    const UnifiedLending = await ethers.getContractFactory("UnifiedLending");
    const contract = UnifiedLending.attach(contractAddress).connect(wallet);

    console.log("Interacting with contract at:", contractAddress);

    // Register a borrower
    const tx = await contract.registerBorrower(
        "Alice", "1234567890", "alice@email.com", "Some Address", "1990-01-01"
    );
    
    console.log("Transaction sent! Waiting for confirmation...");
    await tx.wait();  // Wait for confirmation

    console.log("Transaction confirmed!");
    console.log(`See transaction at: https://sepolia.etherscan.io/tx/${tx.hash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

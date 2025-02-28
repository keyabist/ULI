const hre = require("hardhat");

async function main() {
  const UnifiedLending = await hre.ethers.getContractFactory("UnifiedLending");
  const contract = await UnifiedLending.deploy();

  await contract.waitForDeployment(); // FIX

  console.log("Contract deployed at:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

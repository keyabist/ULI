const { ethers } = require("hardhat");

async function main() {
  const [deployer, borrower, lender] = await ethers.getSigners();

  // Deploy the UnifiedLending contract
  const UnifiedLending = await ethers.getContractFactory("UnifiedLending", deployer);
  const lendingContract = await UnifiedLending.deploy();
  await lendingContract.waitForDeployment();
  console.log("Contract deployed at:", lendingContract.target);

  // Register the borrower
  let tx = await lendingContract.connect(borrower).registerBorrower(
    "borrowerUsername",
    "borrowerPassword",
    "Borrower Name",
    "1234567890",
    "borrower@example.com",
    "Borrower Address"
  );
  await tx.wait();
  console.log("Borrower registered:", borrower.address);

  // Register the lender
  tx = await lendingContract.connect(lender).registerLender(
    "lenderUsername",
    "lenderPassword",
    "Lender Name",
    "0987654321",
    "lender@example.com",
    5,      // interest rate
    1000    // monthly income
  );
  await tx.wait();
  console.log("Lender registered:", lender.address);

  // Borrower requests a loan from the lender
  const amount = ethers.parseUnits("1", "ether"); // 1 ETH
  const repaymentPeriod = 12; // 12 months
  tx = await lendingContract.connect(borrower).requestLoan(amount, repaymentPeriod, lender.address);
  await tx.wait();
  console.log("Loan request submitted by borrower from lender", lender.address);

  // Read back the loan details
  const loan = await lendingContract.loans(1);
  console.log("Stored Loan:", {
    loanId: loan.loanId.toString(),
    borrower: loan.borrower,
    lender: loan.lender,
    amount: ethers.formatUnits(loan.amount, "ether") + " ETH",
    status: loan.status.toNumber(), // Expected to be 0 (Pending)
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

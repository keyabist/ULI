# Unified Lending Interface (ULI)

## Overview
Unified Lending Interface (ULI) is a blockchain-based decentralized lending platform that facilitates secure and transparent interactions between lenders and borrowers. The platform leverages smart contracts to ensure trustless transactions, eliminating intermediaries and enhancing financial inclusivity.

## Features
- **Decentralized Lending**: Direct lender-borrower interaction without intermediaries.
- **MetaMask Integration**: Users can connect their wallets seamlessly.
- **Lender Registration**: Lenders can register and store their details on the blockchain.
- **Smart Contract-Based Transactions**: Ensures security and transparency in lending.
- **Immutable Records**: Loan details are stored on the blockchain, preventing data tampering.

## Tech Stack
- **Frontend**: React.js (with TailwindCSS for styling)
- **Backend**: Node.js, Express.js
- **Blockchain**: Solidity, Hardhat, Ethereum (Sepolia test network)
- **Authentication**: MetaMask Wallet

## Installation
1. **Clone the repository**
   ```sh
   git clone https://github.com/keyabist/ULI.git
   cd ULI
   ```
2. **Install dependencies**
   ```sh
   npm install
   ```
3. **Start the development server**
   ```sh
   npm run dev
   ```
4. **Deploy Smart Contracts** (Ensure Hardhat is installed)
   ```sh
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network sepolia
   ```

## Usage
- Connect MetaMask wallet.
- Register as a lender and store details on the blockchain.
- Borrowers can browse available lenders and initiate loans.
- Smart contracts handle transactions securely.

## Roadmap
- Implement borrower verification.
- Add interest rate calculations and repayment tracking.
- Improve UI/UX for better user experience.
- Expand to multiple blockchain networks.

## Contributing
Contributions are welcome! Feel free to fork the repo and create a pull request with enhancements or bug fixes.

## License
This project is licensed under the MIT License.



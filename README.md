# Unified Lending Interface (ULI)

## Overview
Unified Lending Interface (ULI) is a blockchain-based decentralized lending platform that facilitates secure and transparent interactions between lenders and borrowers. The platform leverages smart contracts to ensure trustless transactions, eliminating intermediaries and enhancing financial inclusivity.

## Features
- **MetaMask Integration**: Users can connect their wallets seamlessly.
- **Borrower and Lender Registration**: User can register and store their details on the blockchain based on their roles.
- **Decentralized Lending**: Direct lender-borrower interaction without intermediaries.
- **Smart Contract-Based Transactions**: Ensures security and transparency in lending.
- **Immutable Records**: Loan details are stored on the blockchain, preventing data tampering.

## Tech Stack
- **Frontend**: React.js (with TailwindCSS for styling)
- **Blockchain**: Solidity,Ethereum (Sepolia test network)
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
4. **Deploy ML-model** (Ensure required libraries are installed)
   ```sh
  cd MLBACKEND
  python app.py
   ```

## Usage
- Connect MetaMask wallet.
- Register as a lender or borrower and store details on the blockchain.
- Borrowers can browse available lenders and initiate loans.
- While appyling loans, signature will be asked to verify the original or forged using a ML-model.
- Lenders can aprrove or reject requests, if they approve amount transfers and updates credit score.
- Approved loans must be repaid by borrowers in insatllments.
- Smart contracts handle transactions securely.







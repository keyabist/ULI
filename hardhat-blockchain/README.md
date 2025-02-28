# Hardhat Blockchain Project

presently theres no neeed to run and deploy contract in ur systems, its deployed to sepolia network(link to which can be seen in .env file)

Also if you dont have test eth, then u can deploy in local environment itself and get 20 frees account and countinue.

smartcontract address:-"0x6557dfB6F775b5188DA88E9Fc6178247214d64Ef"
abi can be found in hardhat-blockchain>>artifacts>>contracts>>UnifiedLending

## Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Hardhat](https://hardhat.org/) (installed via npm)
- [MetaMask](https://metamask.io/) browser extension

## Setup Instructions
### 1. Clone the Repository
```sh
git clone <repository-url>
cd <project-folder>
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Start the Hardhat Local Network
```sh
npx hardhat node
```
This will start a local Ethereum network and display a list of test accounts with private keys.
if you enough of test eth then u dont want this.

### 4. Connect MetaMask to Hardhat Local Network
1. Open MetaMask and go to **Metamask > Networks > Add custom Network**.
2. Click **Add a Network Manually**.
3. Enter the following details:
   - **Network Name**: Hardhat Local
   - **New RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH
4. Click **Save**.
5. Import one of the test accounts from the Hardhat node by using its private key.
6. To import click on ur account on dropdown click **Add Account or hardware wallet>>import account>>(enter the details like private key from one of the account in hardhat accounts that gave after starting hardhat node>>import**
7. this creates a separate account and also shows the balance .

### 5. Deploy Smart Contracts
Run the deployment script:
```sh
npx hardhat run scripts/deploy.js --network localhost
```

### 6. Adding New Smart Contracts
- Place new Solidity files inside the `contracts/` folder.
- Update the deployment script in `scripts/deploy.js` to deploy the new contract.
- Run the deployment script again.

### 7. Testing the Smart Contracts
Run the tests using:
```sh
npx hardhat test
```



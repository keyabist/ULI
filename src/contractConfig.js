export const contractConfig = {
    contractAddress: "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F",  // Replace with actual contract address
    rpcUrl: "https://eth-sepolia.alchemyapi.io/v2/0djlRuL7g5qo-i8QYdXMsoGX7jSySmkm",  // Replace with actual RPC URL
    abi: [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "borrower",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "BorrowerRegistered",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "lender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          }
        ],
        "name": "LenderRegistered",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "loanId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "lender",
            "type": "address"
          }
        ],
        "name": "LoanApproved",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "loanId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "lender",
            "type": "address"
          }
        ],
        "name": "LoanRejected",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "loanId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "borrower",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "lender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "LoanRequested",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "uint256",
            "name": "loanId",
            "type": "uint256"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "PaymentMade",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          }
        ],
        "name": "approveLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "borrowerList",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "borrowers",
        "outputs": [
          {
            "internalType": "address",
            "name": "borrowerAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "phone",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "email",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "creditScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "monthlyIncome",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isRegistered",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "govidCID",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "signatureCID",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "verified",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getAllBorrowers",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getAllLenders",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_borrower",
            "type": "address"
          }
        ],
        "name": "getBorrowerProfile",
        "outputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "phone",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "email",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "creditScore",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "monthlyIncome",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "govidCID",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "signatureCID",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "verified",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_lender",
            "type": "address"
          }
        ],
        "name": "getLenderProfile",
        "outputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "phone",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "email",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "interestRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "monthlyIncome",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "govidCID",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "signatureCID",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "verified",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          }
        ],
        "name": "getTransactions",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "loanId",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "from",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              }
            ],
            "internalType": "struct UnifiedLending.Transaction[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "lenderList",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "lenders",
        "outputs": [
          {
            "internalType": "address",
            "name": "lenderAddress",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "phone",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "email",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "interestRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "monthlyIncome",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isRegistered",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "govidCID",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "signatureCID",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "verified",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "loanTransactions",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "loanId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "loans",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "loanId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "borrower",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "lender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountPaid",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "repaymentPeriod",
            "type": "uint256"
          },
          {
            "internalType": "enum UnifiedLending.LoanStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "interestRate",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "nextLoanId",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          }
        ],
        "name": "recordPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_phone",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_email",
            "type": "string"
          }
        ],
        "name": "registerBorrower",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_phone",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_email",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "_interestRate",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_monthlyIncome",
            "type": "uint256"
          }
        ],
        "name": "registerLender",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_loanId",
            "type": "uint256"
          }
        ],
        "name": "rejectLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "_repaymentPeriod",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "_lender",
            "type": "address"
          }
        ],
        "name": "requestLoan",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "phone",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "email",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "creditScore",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "monthlyIncome",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "govidCID",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "signatureCID",
                "type": "string"
              },
              {
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
              }
            ],
            "internalType": "struct UnifiedLending.BorrowerProfileData",
            "name": "profileData",
            "type": "tuple"
          }
        ],
        "name": "updateBorrowerProfile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "phone",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "email",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "interestRate",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "monthlyIncome",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "govidCID",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "signatureCID",
                "type": "string"
              },
              {
                "internalType": "bool",
                "name": "verified",
                "type": "bool"
              }
            ],
            "internalType": "struct UnifiedLending.LenderProfileData",
            "name": "profileData",
            "type": "tuple"
          }
        ],
        "name": "updateLenderProfile",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    }
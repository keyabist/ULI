// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UnifiedLending {
    struct Borrower {
        address borrowerAddress;
        string name;
        string phone;
        string email;
        string addressDetails;
        string dob;
        bool isRegistered;
    }
    
    struct Lender {
        address lenderAddress;
        string name;
        string phone;
        string email;
        bool isRegistered;
    }

    mapping(address => Borrower) public borrowers;
    mapping(address => Lender) public lenders;
    
    Borrower[] public borrowerList;
    Lender[] public lenderList;

    event BorrowerRegistered(address indexed borrower, string name, string email);
    event LenderRegistered(address indexed lender, string name, string email);
    event BorrowerUpdated(address indexed borrower, string name, string email);
    event LenderUpdated(address indexed lender, string name, string email);

    modifier onlyUnregisteredBorrower() {
        require(!borrowers[msg.sender].isRegistered, "Already registered as a borrower");
        require(!lenders[msg.sender].isRegistered, "Already registered as a lender");
        _;
    }
    
    modifier onlyUnregisteredLender() {
        require(!lenders[msg.sender].isRegistered, "Already registered as a lender");
        require(!borrowers[msg.sender].isRegistered, "Already registered as a borrower");
        _;
    }

    function registerBorrower(string memory _name, string memory _phone, string memory _email, string memory _addressDetails, string memory _dob) external onlyUnregisteredBorrower {
        Borrower memory newBorrower = Borrower(msg.sender, _name, _phone, _email, _addressDetails, _dob, true);
        borrowers[msg.sender] = newBorrower;
        borrowerList.push(newBorrower);
        emit BorrowerRegistered(msg.sender, _name, _email);
    }

    function registerLender(string memory _name, string memory _phone, string memory _email) external onlyUnregisteredLender {
        Lender memory newLender = Lender(msg.sender, _name, _phone, _email, true);
        lenders[msg.sender] = newLender;
        lenderList.push(newLender);
        emit LenderRegistered(msg.sender, _name, _email);
    }

    function getBorrower(address _borrower) external view returns (Borrower memory) {
        require(borrowers[_borrower].isRegistered, "Borrower not found");
        return borrowers[_borrower];
    }

    function getLender(address _lender) external view returns (Lender memory) {
        require(lenders[_lender].isRegistered, "Lender not found");
        return lenders[_lender];
    }

    function getAllBorrowers() external view returns (Borrower[] memory) {
        return borrowerList;
    }

    function getAllLenders() external view returns (Lender[] memory) {
        return lenderList;
    }

    function updateBorrower(string memory _name, string memory _phone, string memory _email, string memory _addressDetails, string memory _dob) external {
        require(borrowers[msg.sender].isRegistered, "Not registered as borrower");
        
        borrowers[msg.sender] = Borrower(msg.sender, _name, _phone, _email, _addressDetails, _dob, true);
        
        for (uint i = 0; i < borrowerList.length; i++) {
            if (borrowerList[i].borrowerAddress == msg.sender) {
                borrowerList[i] = borrowers[msg.sender];
                break;
            }
        }
        
        emit BorrowerUpdated(msg.sender, _name, _email);
    }

    function updateLender(string memory _name, string memory _phone, string memory _email) external {
        require(lenders[msg.sender].isRegistered, "Not registered as lender");
        
        lenders[msg.sender] = Lender(msg.sender, _name, _phone, _email, true);
        
        for (uint i = 0; i < lenderList.length; i++) {
            if (lenderList[i].lenderAddress == msg.sender) {
                lenderList[i] = lenders[msg.sender];
                break;
            }
        }
        
        emit LenderUpdated(msg.sender, _name, _email);
    }
}
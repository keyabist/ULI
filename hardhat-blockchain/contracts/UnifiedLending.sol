// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UnifiedLending {
    enum LoanStatus { Pending, Approved, Rejected, Completed }
    
    // Updated Borrower struct with document fields and verified flag
    struct Borrower {
        address borrowerAddress;
        string name;
        string phone;
        string email;
        uint creditScore;
        uint monthlyIncome;
        bool isRegistered;
        string govidCID;       // CID for government ID document
        string signatureCID;   // CID for signature document
        bool verified;         // Verification flag (to be updated later)
    }
    
    // Updated Lender struct with document fields and verified flag
    struct Lender {
        address lenderAddress;
        string name;
        string phone;
        string email;
        uint interestRate;
        uint monthlyIncome;
        bool isRegistered;
        string govidCID;       // CID for government ID document
        string signatureCID;   // CID for signature document
        bool verified;         // Verification flag (to be updated later)
    }
    
    struct Loan {
        uint loanId;
        address borrower;
        address lender;
        uint amount;
        uint amountPaid;
        uint repaymentPeriod;
        LoanStatus status;
        uint interestRate;
    }
    
    struct Transaction {
        uint loanId;
        address from;
        address to;
        uint amount;
        uint timestamp;
    }

    mapping(address => Borrower) public borrowers;
    mapping(address => Lender) public lenders;
    mapping(uint => Loan) public loans;
    mapping(uint => Transaction[]) public loanTransactions;
    
    address[] public borrowerList;
    address[] public lenderList;
    
    uint public nextLoanId = 1;
    
    event BorrowerRegistered(address indexed borrower, string name);
    event LenderRegistered(address indexed lender, string name);
    event LoanRequested(uint indexed loanId, address indexed borrower, address indexed lender, uint amount);
    event LoanApproved(uint indexed loanId, address indexed lender);
    event LoanRejected(uint indexed loanId, address indexed lender);
    event PaymentMade(uint indexed loanId, address indexed from, address indexed to, uint amount);
    
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
    
    modifier onlyRegisteredBorrower() {
        require(borrowers[msg.sender].isRegistered, "Not registered as a borrower");
        _;
    }
    
    modifier onlyRegisteredLender() {
        require(lenders[msg.sender].isRegistered, "Not registered as a lender");
        _;
    }
    
    // Registration functions (document fields are initialized as empty and verified flag as false)
    function registerBorrower(
        string memory _name,
        string memory _phone,
        string memory _email
    ) external onlyUnregisteredBorrower {
        borrowers[msg.sender] = Borrower(
            msg.sender,
            _name,
            _phone,
            _email,
            0,
            0,
            true,
            "",     // govidCID (empty initially)
            "",     // signatureCID (empty initially)
            false   // verified flag
        );
        borrowerList.push(msg.sender);
        emit BorrowerRegistered(msg.sender, _name);
    }
    
    function registerLender(
        string memory _name,
        string memory _phone,
        string memory _email,
        uint _interestRate,
        uint _monthlyIncome
    ) external onlyUnregisteredLender {
        lenders[msg.sender] = Lender(
            msg.sender,
            _name,
            _phone,
            _email,
            _interestRate,
            _monthlyIncome,
            true,
            "",     // govidCID (empty initially)
            "",     // signatureCID (empty initially)
            false   // verified flag
        );
        lenderList.push(msg.sender);
        emit LenderRegistered(msg.sender, _name);
    }
    
    // Loan functions
    function requestLoan(uint _amount, uint _repaymentPeriod, address _lender) external onlyRegisteredBorrower {
        require(lenders[_lender].isRegistered, "Lender not found");
        loans[nextLoanId] = Loan(
            nextLoanId,
            msg.sender,
            _lender,
            _amount,
            0,
            _repaymentPeriod,
            LoanStatus.Pending,
            lenders[_lender].interestRate
        );
        emit LoanRequested(nextLoanId, msg.sender, _lender, _amount);
        nextLoanId++;
    }
    
    function approveLoan(uint _loanId) external onlyRegisteredLender {
        require(loans[_loanId].lender == msg.sender, "Not authorized to approve this loan");
        require(loans[_loanId].status == LoanStatus.Pending, "Loan already processed");
        loans[_loanId].status = LoanStatus.Approved;
        emit LoanApproved(_loanId, msg.sender);
    }
    
    function rejectLoan(uint _loanId) external onlyRegisteredLender {
        require(loans[_loanId].lender == msg.sender, "Not authorized to reject this loan");
        require(loans[_loanId].status == LoanStatus.Pending, "Loan already processed");
        loans[_loanId].status = LoanStatus.Rejected;
        emit LoanRejected(_loanId, msg.sender);
    }
    
    function recordPayment(uint _loanId, uint _amount) external {
        require(loans[_loanId].status == LoanStatus.Approved, "Loan not approved");
        require(msg.sender == loans[_loanId].borrower, "Only borrower can make payments");
        loans[_loanId].amountPaid += _amount;
        loanTransactions[_loanId].push(
            Transaction(_loanId, msg.sender, loans[_loanId].lender, _amount, block.timestamp)
        );
        if (loans[_loanId].amountPaid >= loans[_loanId].amount) {
            loans[_loanId].status = LoanStatus.Completed;
        }
        emit PaymentMade(_loanId, msg.sender, loans[_loanId].lender, _amount);
    }
    
    function getTransactions(uint _loanId) external view returns (Transaction[] memory) {
        return loanTransactions[_loanId];
    }
    
    function getAllBorrowers() external view returns (address[] memory) {
        return borrowerList;
    }
    
    function getAllLenders() external view returns (address[] memory) {
        return lenderList;
    }
    
    // --- Profile Management ---
    // To prevent "stack too deep", we group profile update fields into structs.

    struct BorrowerProfileData {
        string name;
        string phone;
        string email;
        uint creditScore;
        uint monthlyIncome;
        string govidCID;
        string signatureCID;
        bool verified;
    }
    
    struct LenderProfileData {
        string name;
        string phone;
        string email;
        uint interestRate;
        uint monthlyIncome;
        string govidCID;
        string signatureCID;
        bool verified;
    }
    
    function getBorrowerProfile(address _borrower) external view returns (
        string memory name,
        string memory phone,
        string memory email,
        uint creditScore,
        uint monthlyIncome,
        string memory govidCID,
        string memory signatureCID,
        bool verified
    ) {
        require(borrowers[_borrower].isRegistered, "Borrower not registered");
        Borrower memory b = borrowers[_borrower];
        return (
            b.name,
            b.phone,
            b.email,
            b.creditScore,
            b.monthlyIncome,
            b.govidCID,
            b.signatureCID,
            b.verified
        );
    }
    
    function getLenderProfile(address _lender) external view returns (
        string memory name,
        string memory phone,
        string memory email,
        uint interestRate,
        uint monthlyIncome,
        string memory govidCID,
        string memory signatureCID,
        bool verified
    ) {
        require(lenders[_lender].isRegistered, "Lender not registered");
        Lender memory l = lenders[_lender];
        return (
            l.name,
            l.phone,
            l.email,
            l.interestRate,
            l.monthlyIncome,
            l.govidCID,
            l.signatureCID,
            l.verified
        );
    }
    
    // Use grouped struct for profile update to avoid stack too deep error.
    function updateBorrowerProfile(BorrowerProfileData calldata profileData) external onlyRegisteredBorrower {
        Borrower storage b = borrowers[msg.sender];
        b.name = profileData.name;
        b.phone = profileData.phone;
        b.email = profileData.email;
        b.creditScore = profileData.creditScore;
        b.monthlyIncome = profileData.monthlyIncome;
        b.govidCID = profileData.govidCID;
        b.signatureCID = profileData.signatureCID;
        b.verified = profileData.verified;
    }
    
    function updateLenderProfile(LenderProfileData calldata profileData) external onlyRegisteredLender {
        Lender storage l = lenders[msg.sender];
        l.name = profileData.name;
        l.phone = profileData.phone;
        l.email = profileData.email;
        l.interestRate = profileData.interestRate;
        l.monthlyIncome = profileData.monthlyIncome;
        l.govidCID = profileData.govidCID;
        l.signatureCID = profileData.signatureCID;
        l.verified = profileData.verified;
    }
}

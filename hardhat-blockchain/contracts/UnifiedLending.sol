// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UnifiedLending {
    enum LoanStatus { Pending, Approved, Rejected, Completed }
    
    // Borrower struct with document fields and credit score
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
    }
    
    // Lender struct with document fields, credit score and interest rate
    struct Lender {
        address lenderAddress;
        string name;
        string phone;
        string email;
        uint interestRate;
        uint monthlyIncome;
        uint creditScore;
        bool isRegistered;
        string govidCID;       // CID for government ID document
        string signatureCID;   // CID for signature document
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
    
    // --- Registration functions ---
    // Borrower registration now includes monthly income as an input.
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
            0,              // creditScore initially 0
            0, // monthlyIncome provided at registration
            true,
            "",             // govidCID (empty initially)
            ""              // signatureCID (empty initially)
        );
        borrowerList.push(msg.sender);
        emit BorrowerRegistered(msg.sender, _name);
    }
    
    // Lender registration now initializes creditScore to 0.
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
            0,              // creditScore initially 0 for lender
            true,
            "",             // govidCID (empty initially)
            ""              // signatureCID (empty initially)
        );
        lenderList.push(msg.sender);
        emit LenderRegistered(msg.sender, _name);
    }
    
    // --- Loan functions ---
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
    // Merged ProfileData struct for both borrowers and lenders.
    // Note: For borrowers, interestRate is unused; for lenders, creditScore is updated.
    struct ProfileData {
        string name;
        string phone;
        string email;
        uint creditScore;
        uint interestRate;
        uint monthlyIncome;
        string govidCID;
        string signatureCID;
    }
    
    // Instead of returning individual fields, we now return the entire struct.
    function getBorrowerProfile(address _borrower) external view returns (Borrower memory) {
        require(borrowers[_borrower].isRegistered, "Borrower not registered");
        return borrowers[_borrower];
    }
    
    function getLenderProfile(address _lender) external view returns (Lender memory) {
        require(lenders[_lender].isRegistered, "Lender not registered");
        return lenders[_lender];
    }
    
    // Profile update for borrowers
    function updateBorrowerProfile(ProfileData calldata profileData) external onlyRegisteredBorrower {
        Borrower storage b = borrowers[msg.sender];
        b.name = profileData.name;
        b.phone = profileData.phone;
        b.email = profileData.email;
        b.creditScore = profileData.creditScore;
        b.monthlyIncome = profileData.monthlyIncome;
        b.govidCID = profileData.govidCID;
        b.signatureCID = profileData.signatureCID;
    }
    
    // Profile update for lenders now updates creditScore as well.
    function updateLenderProfile(ProfileData calldata profileData) external onlyRegisteredLender {
        Lender storage l = lenders[msg.sender];
        l.name = profileData.name;
        l.phone = profileData.phone;
        l.email = profileData.email;
        l.interestRate = profileData.interestRate;
        l.monthlyIncome = profileData.monthlyIncome;
        l.creditScore = profileData.creditScore;
        l.govidCID = profileData.govidCID;
        l.signatureCID = profileData.signatureCID;
    }
}

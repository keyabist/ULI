// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UnifiedLending {
    enum LoanStatus { Pending, Approved, Rejected, Completed }
    
    struct Borrower {
        address borrowerAddress;
        string username;
        string password;
        string name;
        string phone;
        string email;
        string addressDetails;
        uint creditScore;
        uint monthlyIncome;
        bool isRegistered;
    }
    
    struct Lender {
        address lenderAddress;
        string username;
        string password;
        string name;
        string phone;
        string email;
        uint interestRate;
        uint monthlyIncome;
        bool isRegistered;
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

    function registerBorrower(
        string memory _username, 
        string memory _password, 
        string memory _name, 
        string memory _phone, 
        string memory _email, 
        string memory _addressDetails
    ) external onlyUnregisteredBorrower {
        borrowers[msg.sender] = Borrower(
            msg.sender, 
            _username, 
            _password, 
            _name, 
            _phone, 
            _email, 
            _addressDetails, 
            0, 
            0, 
            true
        );
        borrowerList.push(msg.sender);
        emit BorrowerRegistered(msg.sender, _name);
    }

    function registerLender(
        string memory _username, 
        string memory _password, 
        string memory _name, 
        string memory _phone, 
        string memory _email, 
        uint _interestRate, 
        uint _monthlyIncome
    ) external onlyUnregisteredLender {
        lenders[msg.sender] = Lender(
            msg.sender, 
            _username, 
            _password, 
            _name, 
            _phone, 
            _email, 
            _interestRate, 
            _monthlyIncome, 
            true
        );
        lenderList.push(msg.sender);
        emit LenderRegistered(msg.sender, _name);
    }

    function requestLoan(uint _amount, uint _repaymentPeriod, address _lender) external {
        require(borrowers[msg.sender].isRegistered, "Only registered borrowers can request loans");
        require(lenders[_lender].isRegistered, "Lender not found");
        
        loans[nextLoanId] = Loan(nextLoanId, msg.sender, _lender, _amount, 0, _repaymentPeriod, LoanStatus.Pending, lenders[_lender].interestRate);
        emit LoanRequested(nextLoanId, msg.sender, _lender, _amount);
        nextLoanId++;
    }

    function approveLoan(uint _loanId) external {
        require(lenders[msg.sender].isRegistered, "Only registered lenders can approve loans");
        require(loans[_loanId].lender == msg.sender, "Not authorized to approve this loan");
        require(loans[_loanId].status == LoanStatus.Pending, "Loan already processed");
        
        loans[_loanId].status = LoanStatus.Approved;
        emit LoanApproved(_loanId, msg.sender);
    }

    function recordPayment(uint _loanId, uint _amount) external {
        require(loans[_loanId].status == LoanStatus.Approved, "Loan not approved");
        require(msg.sender == loans[_loanId].borrower, "Only borrower can make payments");
        
        loans[_loanId].amountPaid += _amount;
        loanTransactions[_loanId].push(Transaction(_loanId, msg.sender, loans[_loanId].lender, _amount, block.timestamp));

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
}
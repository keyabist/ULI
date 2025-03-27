import './App.css'
import RegistrationForm from './components/RegistrationForm.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/navbar';
import LenderDashboard from './components/LenderDashboard';
import BorrowerDashboard from './components/BorrowerDashboard';
import EditProfileForm from './components/EditProfileForm';
import WalletConnect from './components/connectWallet';
import LoanRequestForm from './components/RequestForm';
import CompleteProfile from './components/completeProfileBor';
import Navbar from './components/navbarLender.jsx';
import ActiveLoans from './components/ActiveLoans';
import PendingRequests from './components/PendingRequests';
import TransactionPage from './components/TransactionPage';
import LoanStatus from './components/LoanStatus.jsx';
import ViewProfile from './components/ViewProfile.jsx';
import RequestStatusPage from './components/RequestStatusPage.jsx';
import RejectedLoansPage from './components/RejectedLoans.jsx';
import CompletedLoansPage from './components/CompletedLoans.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WalletConnect />} />
          <Route path="/registrationForm" element={<RegistrationForm />} />
          <Route path="/lenderDashboard" element={<LenderDashboard />} />
          <Route path="/borrowerDashboard" element={<BorrowerDashboard />} />
          <Route path="/edit-profile" element={<EditProfileForm />} />
          <Route path="/view-profile/:userAddress" element={<ViewProfile />} />
          <Route path='navbar-lender' element={<Navbar />} />
          <Route path="/requestForm" element={<LoanRequestForm />} />
          <Route path="/completeProfile" element={<CompleteProfile />} />
          <Route path="/activeLoans" element={<ActiveLoans />} />
          <Route path="/pendingRequests" element={<PendingRequests />} />
          <Route path="/transactionPage" element={<TransactionPage />} />
          <Route path="/loanStatus/:loanId" element={<LoanStatus />} />
          <Route path='/requestStatusPage' element={<RequestStatusPage />} />
          <Route path='/rejectedLoansPage' element={<RejectedLoansPage />} />
          <Route path='/completedLoansPage' element={<CompletedLoansPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;

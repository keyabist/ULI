import './App.css'
import RegistrationForm from './pages/RegistrationForm.jsx'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/navbar.jsx';
import LenderDashboard from './pages/LenderDashboard';
import BorrowerDashboard from './pages/BorrowerDashboard';
import EditProfileForm from './pages/EditProfileForm';
import WalletConnect from './pages/connectWallet';
import LoanRequestForm from './pages/RequestForm';
import CompleteProfile from './pages/completeProfileBor';
import Navbar from './components/navbarLender.jsx';
import ActiveLoans from './pages/ActiveLoans';
import PendingRequests from './pages/PendingRequests';
import TransactionPage from './pages/TransactionPage';
import LoanStatus from './pages/LoanStatus.jsx';
import ViewProfile from './pages/ViewProfile.jsx';
import RequestStatusPage from './pages/RequestStatusPage.jsx';
import RejectedLoansPage from './pages/RejectedLoans.jsx';
import CompletedLoansPage from './pages/CompletedLoans.jsx';
import Intro from './pages/SplashScreen.jsx';

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
          <Route path='/splashScreen' element={<Intro />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;

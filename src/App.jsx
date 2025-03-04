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
          <Route path="/requestForm" element={<LoanRequestForm />} />
          <Route path="/completeProfile" element={<CompleteProfile />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App

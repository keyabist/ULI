import './App.css'
import Login from './components/Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/navbar';
import LenderDashboard from './components/LenderDashboard';
import BorrowerDashboard from './components/BorrowerDashboard';
import EditProfileForm from './components/EditProfileForm';
import WalletConnect from './components/connectWallet';

function App() {
  return (
    <Router>
      <div className="App">
        
        <Routes>
          <Route path="/" element={<WalletConnect />} />
          <Route path="/lenderDashboard" element={<LenderDashboard />} />
          <Route path="/borrowerDashboard" element={<BorrowerDashboard />} />
          <Route path="/edit-profile" element={<EditProfileForm />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

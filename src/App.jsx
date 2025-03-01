import './App.css'
import Login from './Login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/navbar';
import LenderDashboard from './components/LenderDashboard';
import BorrowerDashboard from './components/BorrowerDashboard';
import EditProfileForm from './components/EditProfileForm';

function App() {
  return (
    <Router>
      <div className="App">
        
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/lenderDashboard" element={<LenderDashboard />} />
          <Route path="/borrowerDashboard" element={<BorrowerDashboard />} />
          <Route path="/edit-profile" element={<EditProfileForm />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import LenderDashboard from './components/LenderDashboard';
import BorrowerDashboard from './components/BorrowerDashboard';
import EditProfileForm from './components/EditProfileForm';

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/lender" element={<LenderDashboard />} />
          <Route path="/borrower" element={<BorrowerDashboard />} />
          <Route path="/edit-profile" element={<EditProfileForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

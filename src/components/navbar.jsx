import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProfileIcon from './ProfileIcon.jsx';
import './navbar.css';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/borrowerDashboard', label: 'Dashboard' },
    { path: '/requestForm', label: 'Request Loan' },
    { path: '/activeLoans', label: 'Active Loans' },
    { path: '/pendingRequests', label: 'Pending Requests' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/borrowerDashboard" className="navbar-logo">
          <span className="logo-text">ULI</span>
        </Link>

        <button
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="navbar-profile">
            <ProfileIcon />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

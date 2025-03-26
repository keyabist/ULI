import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate } from 'react-router-dom';
import ProfileIcon from './ProfileIcon.jsx';

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any global wallet/account state if needed.
    navigate("/"); // Reroute to the connect wallet page.
  };

  return (
    <AppBar position="fixed" sx={{ width: '100%' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Borrower Dashboard
        </Typography>
        <IconButton color="inherit" component={Link} to="/borrowerDashboard">
          Borrower
        </IconButton>
        <IconButton color="inherit" component={Link} to="/completedLoansPage">
          Completed Loans
        </IconButton>
        <IconButton color="inherit" component={Link} to="/requestStatusPage">
          Requests History
        </IconButton>
        <ProfileIcon />
        <IconButton color="inherit" onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;

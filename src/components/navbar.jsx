import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ProfileIcon from './ProfileIcon.jsx';

const NavBar = () => {
  return (
    <AppBar position="fixed" sx={{ width: '100%' }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Borrower Dashboard
        </Typography>
        <Button color="inherit" component={Link} to="/borrowerDashboard">Borrower</Button>
        <Button color='inherit' component={Link} to="/completedLoansPage">Completed Loans</Button>
        <Button color='inherit' component={Link} to="/requestStatusPage"> Requests History</Button>
        <ProfileIcon />
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;

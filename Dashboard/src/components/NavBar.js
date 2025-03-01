import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ProfileIcon from './ProfileIcon';

const NavBar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Lending Dashboard
        </Typography>
        <Button color="inherit" component={Link} to="/lender">Lender</Button>
        <Button color="inherit" component={Link} to="/borrower">Borrower</Button>
        <ProfileIcon />
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;

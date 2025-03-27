import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate } from 'react-router-dom';
import ProfileIcon from './ProfileIcon.jsx';
import { styled } from '@mui/material/styles';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#000000',
  borderBottom: '3px solid #f0b90b',
});

const StyledTypography = styled(Typography)({
  color: '#f0b90b',
  fontWeight: 'bold',
});

const StyledIconButton = styled(IconButton)({
  color: 'white',
  '&:hover': {
    color: '#f0b90b',
  },
});

const Navbar = () => {
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      }
    };

    fetchAccount();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      } else {
        setAccount('');
        setIsConnected(false);
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const handleLogout = () => {
    setAccount('');
    setIsConnected(false);
    navigate('/'); // Reroute to the connect wallet page.
  };

  return (
    <StyledAppBar position="fixed" sx={{ top: 0, zIndex: 1100 }}>
      <Toolbar>
        <StyledTypography variant="h6" sx={{ flexGrow: 1 }}>
          Lender Dashboard
        </StyledTypography>
        {isConnected && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <StyledIconButton component={Link} to="/lenderDashboard">
              Dashboard
            </StyledIconButton>
            <StyledIconButton component={Link} to="/activeLoans">
              Active Loans
            </StyledIconButton>
            <StyledIconButton component={Link} to="/pendingRequests">
              Pending Requests
            </StyledIconButton>
            <StyledIconButton component={Link} to="/rejectedLoansPage">
              Rejected Loans
            </StyledIconButton>
            <StyledIconButton component={Link} to="/completedLoansPage">
              Completed Loans
            </StyledIconButton>
            <ProfileIcon account={account} />
            <StyledIconButton onClick={handleLogout}>
              <LogoutIcon />
            </StyledIconButton>
          </Box>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;

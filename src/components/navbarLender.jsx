import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate } from 'react-router-dom';
import ProfileIcon from './ProfileIcon.jsx';

const Navbar = () => {
    const [account, setAccount] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                } else {
                    setAccount('');
                    setIsConnected(false);
                }
            });
        }
    }, []);

    const handleLogout = () => {
        // Clear any global wallet/account state if needed.
        navigate("/"); // Reroute to the connect wallet page.
    };

    return (
        <AppBar position="fixed" sx={{ top: 0, zIndex: 1100 }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Lender Dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton color="inherit" component={Link} to="/lenderDashboard">
                        Dashboard
                    </IconButton>
                    <IconButton color="inherit" component={Link} to="/activeLoans">
                        Active Loans
                    </IconButton>
                    <IconButton color="inherit" component={Link} to="/pendingRequests">
                        Pending Requests
                    </IconButton>
                    <IconButton color="inherit" component={Link} to="/rejectedLoansPage">
                        Rejected Loans
                    </IconButton>
                    <IconButton color="inherit" component={Link} to="/completedLoansPage">
                        Completed Loans
                    </IconButton>
                    <ProfileIcon />
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;

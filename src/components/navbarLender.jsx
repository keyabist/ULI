import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Navbar = () => {
    const [account, setAccount] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts',
                });
                setAccount(accounts[0]);
                setIsConnected(true);
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
            }
        } else {
            alert('Please install MetaMask to use this application!');
        }
    };

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

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Blockchain Lending Dashboard
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button color="inherit" component={Link} to="/">
                        Dashboard
                    </Button>
                    <Button color="inherit" component={Link} to="/activeLoans">
                        Active Loans
                    </Button>
                    <Button color="inherit" component={Link} to="/pendingRequests">
                        Pending Requests
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={connectWallet}
                    >
                        {isConnected ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 
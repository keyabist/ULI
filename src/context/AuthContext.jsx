import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from '../contracts/abi.json';

const AuthContext = createContext();

const contractAddress = "0x776fbF8c1b3A64a48EE8976b6825E1Ec76de7B4F";

export const AuthProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);

    const checkUserRole = async (contract, userAccount) => {
        try {
            const borrowerData = await contract.borrowers(userAccount);
            const lenderData = await contract.lenders(userAccount);

            if (borrowerData.isRegistered) {
                return 'borrower';
            } else if (lenderData.isRegistered) {
                return 'lender';
            }
            return null;
        } catch (error) {
            console.error('Error checking user role:', error);
            return null;
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError("MetaMask is not installed! Please install MetaMask and try again.");
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found. Please connect your wallet.");
            }

            const connectedAccount = accounts[0];
            setAccount(connectedAccount);

            // Create provider and signer
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            const newSigner = await newProvider.getSigner();
            setProvider(newProvider);
            setSigner(newSigner);

            // Create contract instance
            const contract = new ethers.Contract(contractAddress, contractABI, newSigner);

            // Check user role
            const userRole = await checkUserRole(contract, connectedAccount);
            setRole(userRole);

            return { account: connectedAccount, role: userRole };
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
            setError(error.message || "Failed to connect wallet. Please try again.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setRole(null);
        setProvider(null);
        setSigner(null);
    };

    useEffect(() => {
        const checkExistingConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    if (accounts.length > 0) {
                        const connectedAccount = accounts[0];
                        setAccount(connectedAccount);

                        const newProvider = new ethers.BrowserProvider(window.ethereum);
                        const newSigner = await newProvider.getSigner();
                        setProvider(newProvider);
                        setSigner(newSigner);

                        const contract = new ethers.Contract(contractAddress, contractABI, newSigner);
                        const userRole = await checkUserRole(contract, connectedAccount);
                        setRole(userRole);
                    }
                } catch (error) {
                    console.error("Error checking existing connection:", error);
                }
            }
            setLoading(false);
        };

        checkExistingConnection();

        // Set up event listeners
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", async (accounts) => {
                if (accounts.length > 0) {
                    const connectedAccount = accounts[0];
                    setAccount(connectedAccount);

                    const newProvider = new ethers.BrowserProvider(window.ethereum);
                    const newSigner = await newProvider.getSigner();
                    setProvider(newProvider);
                    setSigner(newSigner);

                    const contract = new ethers.Contract(contractAddress, contractABI, newSigner);
                    const userRole = await checkUserRole(contract, connectedAccount);
                    setRole(userRole);
                } else {
                    disconnectWallet();
                }
            });

            window.ethereum.on("chainChanged", () => {
                window.location.reload();
            });
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                account,
                role,
                loading,
                error,
                provider,
                signer,
                connectWallet,
                disconnectWallet,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 
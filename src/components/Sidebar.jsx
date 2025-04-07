import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import { ethers } from 'ethers';
import contractABI from "../contracts/abi.json"; // Adjust path as needed
import "../styles/Sidebar.css";

const contractAddress = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUserAddress, setCurrentUserAddress] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchCurrentUserAddress = async () => {
      if (window.ethereum) {
        try {
          // Get the current user's address
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setCurrentUserAddress(accounts[0]);
          }
        } catch (error) {
          console.error("Error getting current user:", error);
        }
      }
    };

    fetchCurrentUserAddress();
  }, []);

  useEffect(() => {
    const checkUserRole = async () => {
      if (window.ethereum && currentUserAddress) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          
          // Check if user is a borrower
          const borrowerData = await contract.borrowers(currentUserAddress);
          if (borrowerData[6]) { // isRegistered field (based on contract structure)
            setUserRole("borrower");
          } else {
            // Check if user is a lender
            const lenderData = await contract.lenders(currentUserAddress);
            if (lenderData[7]) { // isRegistered field (based on contract structure)
              setUserRole("lender");
            }
          }
        } catch (error) {
          console.error("Error checking user role:", error);
        }
      }
    };
    
    if (currentUserAddress) {
      checkUserRole();
    }
  }, [currentUserAddress]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    // Navigate to the wallet connect page on logout
    navigate("/");
    setIsOpen(false);
  };

  return (
    <>
      <button 
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <MenuIcon />
      </button>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <h2 className="sidebar-title">ULI</h2>
        <nav>
          <div 
            className={`nav-item ${location.pathname === "/home" ? "active-link" : ""}`}
            onClick={() => handleNavigation("/home")}
          >
            <HomeIcon /> Home
          </div>
          <div 
            className={`nav-item ${location.pathname.includes("/profile") ? "active-link" : ""}`}
            onClick={() => {
              if (currentUserAddress) {
                handleNavigation(`/view-profile/${currentUserAddress}`);
              } else {
                console.error("No wallet address available");
              }
            }}
          >
            <PersonIcon /> Profile
          </div>
          <div 
            className={`nav-item ${location.pathname.includes("Dashboard") ? "active-link" : ""}`}
            onClick={() => {
              if (userRole === "lender") {
                handleNavigation("/lenderDashboard");
              } else {
                handleNavigation("/borrowerDashboard");
              }
            }}
          >
            <DashboardIcon /> Dashboard
          </div>
          
          {/* Spacer to push logout to bottom */}
          <div className="sidebar-spacer"></div>
          
          {/* Logout button at the bottom */}
          <div 
            className="nav-item logout-button"
            onClick={handleLogout}
          >
            <LogoutIcon /> Logout
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
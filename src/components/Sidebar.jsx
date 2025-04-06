import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
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
            className={`nav-item ${location.pathname === "/" ? "active-link" : ""}`}
            onClick={() => handleNavigation("/")}
          >
            <HomeIcon /> Home
          </div>
          <div 
            className={`nav-item ${location.pathname.includes("/profile") ? "active-link" : ""}`}
            onClick={() => handleNavigation("/view-profile")}
          >
            <PersonIcon /> Profile
          </div>
          <div 
            className={`nav-item ${location.pathname.includes("Dashboard") ? "active-link" : ""}`}
            onClick={() => handleNavigation("/borrowerDashboard")}
          >
            <DashboardIcon /> Dashboard
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import DashboardIcon from "@mui/icons-material/Dashboard";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
          <Link to="/" className={location.pathname === "/" ? "active-link" : ""}>
            <HomeIcon /> Home
          </Link>
          <Link to="/view-profile" className={location.pathname.includes("/view-profile") ? "active-link" : ""}>
            <PersonIcon /> Profile
          </Link>
          <Link to="/lenderDashboard" className={location.pathname === "/lenderDashboard" ? "active-link" : ""}>
            <DashboardIcon /> Dashboard
          </Link>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;

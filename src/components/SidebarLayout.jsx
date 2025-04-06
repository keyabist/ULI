import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const SidebarLayout = () => {
  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh",
      backgroundColor: "#000000"
    }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        overflowY: "auto",
        padding: "20px",
        paddingLeft: "80px" 
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;

import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Typography,
  Divider,
  Fab,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Payment,
  DoneAll,
  PendingActions,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { ethers, BrowserProvider } from "ethers";
import contractABI from "../contracts/abi.json";

const CONTRACT_ADDRESS = "0x3C749Fa9984369506F10c18869E7c51488D8134f";

const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("");
  const [account, setAccount] = useState("");

  const navigate = useNavigate();

  const checkRole = async () => {
    try {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      const borrower = await contract.borrowers(address);
      const lender = await contract.lenders(address);

      if (borrower.isRegistered) setRole("borrower");
      else if (lender.isRegistered) setRole("lender");
      else setRole("");
    } catch (error) {
      console.error("Wallet connection or role fetch failed:", error);
    }
  };

  useEffect(() => {
    checkRole();
  }, []);

  const handleLogout = () => {
    setAccount('');
    navigate('/');
  };

  const menuItems = [
    {
      label: "Home",
      path: `/splashScreen`,
      icon: <AccountCircle style={{ color: "#fff" }} />,
    },
    {
      label: "My Profile",
      path: `/view-profile/${account}`,
      icon: <AccountCircle style={{ color: "#fff" }} />,
    },
    ...(role === "lender"
      ? [
          {
            label: "Active Loans",
            path: "/activeLoans",
            icon: <PendingActions style={{ color: "#fff" }} />,
          },
          {
            label: "Pending Requests",
            path: "/pendingRequests",
            icon: <DoneAll style={{ color: "#fff" }} />,
          },
          {
            label: "Rejected Loans",
            path: "/rejectedLoansPage",
            icon: <DoneAll style={{ color: "#fff" }} />,
          },
          {
            label: "Completed Loans",
            path: "/completedLoansPage",
            icon: <DoneAll style={{ color: "#fff" }} />,
          },
        ]
      : role === "borrower"
      ? [
          {
            label: "Dashboard",
            path: "/borrowerDashboard",
            icon: <PendingActions style={{ color: "#fff" }} />,
          },
          {
            label: "Request Status",
            path: "/requestStatusPage",
            icon: <PendingActions style={{ color: "#fff" }} />,
          },
          {
            label: "Completed Loans",
            path: "/completedLoansPage",
            icon: <Payment style={{ color: "#fff" }} />,
          },
        ]
      : []),
    {
      label: "Logout",
      icon: <LogoutIcon style={{ color: "#fff" }} />,
      onClick: handleLogout,
    },
  ];

  return (
    <>
      {/* Floating Menu Button */}
      {!open && (
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            top: 20,
            left: 20,
            zIndex: 1300,
            backgroundColor: "#1e1e1e",
            "&:hover": { backgroundColor: "#2e7d32" },
          }}
        >
          <MenuIcon />
        </Fab>
      )}

      {/* Drawer when open */}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 240,
            backgroundColor: "#1e1e1e",
            color: "#fff",
            borderRight: "none",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1 }}>
          <Typography variant="h6">Menu</Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ backgroundColor: "#444" }} />

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.label}
              component={item.path ? Link : "button"}
              to={item.path}
              onClick={() => {
                item.onClick?.();
                setOpen(false); // Auto close after click
              }}
              selected={location.pathname === item.path}
              sx={{
                backgroundColor:
                  location.pathname === item.path ? "#2e7d32" : "transparent",
                "&:hover": { backgroundColor: "#2e7d32" },
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ p: 2 }}>
          <Typography variant="caption" sx={{ color: "#ccc" }}>
            {account
              ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
              : "Wallet not connected"}
          </Typography>
          <Typography variant="caption" sx={{ color: "#ccc" }}>
            {role ? `Role: ${role}` : "Detecting role..."}
          </Typography>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;

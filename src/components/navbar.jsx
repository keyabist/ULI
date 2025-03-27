import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import ProfileIcon from "./ProfileIcon.jsx";
import { styled } from "@mui/material/styles";

// Styled Components
const CustomAppBar = styled(AppBar)({
  backgroundColor: "#000000",
  borderBottom: "3px solid #f0b90b",
});

const CustomTypography = styled(Typography)({
  color: "#f0b90b",
  fontWeight: "bold",
});

const CustomIconButton = styled(IconButton)({
  color: "#ffffff",
  "&:hover": {
    color: "#f0b90b",
  },
});

const NavBar = () => {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");

  useEffect(() => {
    const fetchAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };

    fetchAccount();

    window.ethereum?.on("accountsChanged", (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount("");
      }
    });

    return () => {
      window.ethereum?.removeListener("accountsChanged", fetchAccount);
    };
  }, []);

  const handleLogout = () => {
    setAccount(""); // Clear account state
    navigate("/"); // Reroute to the connect wallet page
  };

  return (
    <CustomAppBar position="fixed">
      <Toolbar>
        <CustomTypography variant="h6" sx={{ flexGrow: 1 }}>
          Borrower Dashboard
        </CustomTypography>
        <CustomIconButton component={Link} to="/borrowerDashboard">
          Borrower
        </CustomIconButton>
        <CustomIconButton component={Link} to="/completedLoansPage">
          Completed Loans
        </CustomIconButton>
        <CustomIconButton component={Link} to="/requestStatusPage">
          Requests History
        </CustomIconButton>
        <ProfileIcon account={account} />
        <CustomIconButton onClick={handleLogout}>
          <LogoutIcon />
        </CustomIconButton>
      </Toolbar>
    </CustomAppBar>
  );
};

export default NavBar;

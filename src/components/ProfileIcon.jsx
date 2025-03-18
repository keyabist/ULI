import React from 'react';
import { IconButton } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProfileIcon = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate('/view-profile');
  };

  return (
    <IconButton
      size="large"
      aria-label="account of current user"
      onClick={handleRedirect}
      color="inherit"
    >
      <AccountCircle />
    </IconButton>
  );
};

export default ProfileIcon;

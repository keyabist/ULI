// ProfileModal.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

const ProfileModal = ({ open, onClose, profile }) => {
  if (!profile) return null;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          backgroundColor: "#181818",
          color: "#EAECEF",
          padding: "16px",
        },
      }}
      BackdropProps={{
        style: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <DialogTitle>Profile</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1">
          <strong>Name:</strong> {profile.name || "N/A"}
        </Typography>
        <Typography variant="body1">
          <strong>Address:</strong> {profile.address || "N/A"}
        </Typography>
        <Typography variant="body1">
          <strong>Credit Score:</strong> {profile.creditScore || "N/A"}
        </Typography>
        <Typography variant="body1">
          <strong>Monthly Income:</strong> {profile.monthlyIncome || "N/A"}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileModal;

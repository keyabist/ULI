import React from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';

const EditProfileForm = () => {
  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profile
      </Typography>
      <form>
        <TextField fullWidth margin="normal" label="Name" variant="outlined" />
        <TextField fullWidth margin="normal" label="Email" variant="outlined" type="email" />
        <TextField fullWidth margin="normal" label="Date of Birth" variant="outlined" type="date" InputLabelProps={{ shrink: true }} />
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Save Changes
        </Button>
      </form>
    </Box>
  );
};

export default EditProfileForm;

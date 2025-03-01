import React from 'react';
import { Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const BorrowerDashboard = () => {
  // Placeholder data (replace with actual data fetching later)
  const lenders = [
    { id: 1, name: 'Alice Brown' },
    { id: 2, name: 'Charlie Davis' },
    { id: 3, name: 'Eva White' },
  ];

  return (
    <Paper sx={{ maxWidth: 600, margin: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Borrower Dashboard
      </Typography>
      <Typography variant="h6" gutterBottom>
        Available Lenders
      </Typography>
      <List>
        {lenders.map((lender) => (
          <ListItem key={lender.id}>
            <ListItemText primary={lender.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default BorrowerDashboard;

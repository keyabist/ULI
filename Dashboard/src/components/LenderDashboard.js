import React from 'react';
import { Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const LenderDashboard = () => {
  // Placeholder data (replace with actual data fetching later)
  const borrowers = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Bob Johnson' },
  ];

  return (
    <Paper sx={{ maxWidth: 600, margin: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Lender Dashboard
      </Typography>
      <Typography variant="h6" gutterBottom>
        Registered Borrowers
      </Typography>
      <List>
        {borrowers.map((borrower) => (
          <ListItem key={borrower.id}>
            <ListItemText primary={borrower.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default LenderDashboard;

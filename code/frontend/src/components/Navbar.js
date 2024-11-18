import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          JobInsights V0.1
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} to="/visualization">
            Job Visualization
          </Button>
          <Button color="inherit" component={Link} to="/upload">
            Upload Job
          </Button>
          <Button color="inherit" component={Link} to="/favorites">
            Favorites
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 
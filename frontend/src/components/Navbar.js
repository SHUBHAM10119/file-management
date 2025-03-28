import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { AccountCircle, Logout, Dashboard as DashboardIcon, Person } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';

function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    // Call the logout endpoint and clear token
    await auth.logout();
    
    // Redirect to login page
    navigate('/');
    
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar 
              src="/images/logo.png" 
              alt="Logo" 
              sx={{ 
                width: 32, 
                height: 32, 
                marginRight: 1,
                display: { xs: 'none', sm: 'flex' }
              }} 
            />
            <Typography variant="h6" component="div">
              File Management System
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex' }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/dashboard"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>
            
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <Person fontSize="small" sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar; 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { user } from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
  });
  const [addressForm, setAddressForm] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileData, addressesData] = await Promise.all([
        user.getProfile(),
        user.getAddresses(),
      ]);
      setProfile(profileData);
      setFormData({
        username: profileData.username,
        email: profileData.email,
        phone_number: profileData.phone_number || '',
      });
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await user.updateProfile(formData);
      fetchData();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAddressChange = (e) => {
    setAddressForm({
      ...addressForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await user.updateAddress(editingAddress.id, addressForm);
      } else {
        await user.createAddress(addressForm);
      }
      setOpenAddressDialog(false);
      setEditingAddress(null);
      setAddressForm({
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        is_default: false,
      });
      fetchData();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setOpenAddressDialog(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await user.deleteAddress(addressId);
      fetchData();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <form onSubmit={handleProfileSubmit}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleProfileChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleProfileChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleProfileChange}
                margin="normal"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Update Profile
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Addresses Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Addresses</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingAddress(null);
                  setAddressForm({
                    street: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    country: '',
                    is_default: false,
                  });
                  setOpenAddressDialog(true);
                }}
              >
                Add Address
              </Button>
            </Box>
            <List>
              {addresses.map((address) => (
                <ListItem key={address.id}>
                  <ListItemText
                    primary={`${address.street}, ${address.city}`}
                    secondary={`${address.state}, ${address.postal_code}, ${address.country}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEditAddress(address)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteAddress(address.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Address Dialog */}
      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)}>
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddressSubmit}>
            <TextField
              fullWidth
              label="Street"
              name="street"
              value={addressForm.street}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={addressForm.city}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="State"
              name="state"
              value={addressForm.state}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Postal Code"
              name="postal_code"
              value={addressForm.postal_code}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={addressForm.country}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressDialog(false)}>Cancel</Button>
          <Button onClick={handleAddressSubmit} variant="contained" color="primary">
            {editingAddress ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 
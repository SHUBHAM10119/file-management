import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { user } from '../services/api';

function Profile() {
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    phone_number: '',
  });
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAddress, setCurrentAddress] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });
  const [editMode, setEditMode] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [addressErrors, setAddressErrors] = useState({
    postal_code: '',
    city: '',
    state: '',
    country: ''
  });
  const [profileErrors, setProfileErrors] = useState({
    phone_number: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await user.getProfile();
      setProfile(data);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else {
        setError('Failed to fetch profile');
      }
    }
  };

  const fetchAddresses = async () => {
    try {
      const data = await user.getAddresses();
      setAddresses(data);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else {
        setError('Failed to fetch addresses');
      }
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // For phone_number, only allow numeric input
    if (name === 'phone_number') {
      // If non-numeric characters are entered, don't update the state
      if (value !== '' && !/^\d+$/.test(value)) {
        setProfileErrors({
          ...profileErrors,
          phone_number: 'Phone number must contain only digits'
        });
        return;
      } else {
        setProfileErrors({
          ...profileErrors,
          phone_number: ''
        });
      }
    }
    
    // Validate email format
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setProfileErrors({
          ...profileErrors,
          email: 'Please enter a valid email address'
        });
      } else {
        setProfileErrors({
          ...profileErrors,
          email: ''
        });
      }
    }
    
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const newValue = e.target.type === 'checkbox' ? e.target.checked : value;
    
    // For postal_code, only allow numeric input
    if (name === 'postal_code') {
      // If non-numeric characters are entered, don't update the state
      if (value !== '' && !/^\d*$/.test(value)) {
        return;
      }
      
      // Validate length for postal code (should be exactly 5 digits)
      if (!/^\d{5}$/.test(value) && value !== '') {
        setAddressErrors({
          ...addressErrors,
          postal_code: 'Postal code must be exactly 5 digits'
        });
      } else {
        setAddressErrors({
          ...addressErrors,
          postal_code: ''
        });
      }
    }
    
    // For city, state, and country, only allow alphabetic characters and spaces
    if (['city', 'state', 'country'].includes(name)) {
      // If non-alphabetic characters are entered (except spaces), don't update the state
      if (value !== '' && !/^[a-zA-Z\s]*$/.test(value)) {
        return;
      }
      
      // Clear any previous errors for this field
      if (addressErrors[name]) {
        setAddressErrors({
          ...addressErrors,
          [name]: ''
        });
      }
    }
    
    setCurrentAddress({
      ...currentAddress,
      [name]: newValue,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number before submitting
    if (profile.phone_number && !/^\d+$/.test(profile.phone_number)) {
      setProfileErrors({
        ...profileErrors,
        phone_number: 'Phone number must contain only digits'
      });
      return;
    }
    
    // Validate email before submitting
    if (!validateEmail(profile.email)) {
      setProfileErrors({
        ...profileErrors,
        email: 'Please enter a valid email address'
      });
      return;
    }
    
    try {
      await user.updateProfile(profile);
      setSuccess('Profile updated successfully');
      setError('');
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          setError('Invalid profile data');
        } else {
          setError(String(errorData));
        }
      } else {
        setError('Failed to update profile');
      }
      setSuccess('');
    }
  };

  const handleAddAddress = () => {
    setEditMode(false);
    setCurrentAddress({
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false
    });
    setOpenDialog(true);
  };

  const handleEditAddress = (address) => {
    setEditMode(true);
    setCurrentAddress(address);
    setCurrentAddressId(address.id);
    setOpenDialog(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await user.deleteAddress(addressId);
      fetchAddresses();
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else {
        setError('Failed to delete address');
      }
    }
  };

  const handleSaveAddress = async () => {
    // Create a copy of address errors for validation
    const newErrors = { ...addressErrors };
    let hasErrors = false;
    
    // Validate postal code
    if (!/^\d{5}$/.test(currentAddress.postal_code)) {
      newErrors.postal_code = 'Postal code must be exactly 5 digits';
      hasErrors = true;
    }
    
    // Validate city, state, and country are not empty and contain only alphabetic characters
    ['city', 'state', 'country'].forEach(field => {
      if (!currentAddress[field].trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        hasErrors = true;
      } else if (!/^[a-zA-Z\s]+$/.test(currentAddress[field])) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must contain only letters and spaces`;
        hasErrors = true;
      }
    });
    
    // Update errors and return if validation fails
    if (hasErrors) {
      setAddressErrors(newErrors);
      return;
    }
    
    try {
      if (editMode) {
        await user.updateAddress(currentAddressId, currentAddress);
      } else {
        await user.createAddress(currentAddress);
      }
      fetchAddresses();
      setOpenDialog(false);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else {
        setError('Failed to save address');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile
        </Typography>
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        {success && (
          <Typography color="success.main" gutterBottom>
            {success}
          </Typography>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <form onSubmit={handleProfileSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={profile.username}
                  onChange={handleProfileChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  margin="normal"
                  required
                  error={!!profileErrors.email}
                  helperText={profileErrors.email || 'Enter a valid email address'}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={profile.phone_number || ''}
                  onChange={handleProfileChange}
                  margin="normal"
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  error={!!profileErrors.phone_number}
                  helperText={profileErrors.phone_number || 'Enter numbers only'}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 3 }}
                  disabled={!!profileErrors.phone_number || !!profileErrors.email}
                >
                  Update Profile
                </Button>
              </form>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  My Addresses
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleAddAddress}
                >
                  Add New
                </Button>
              </Box>
              
              {addresses.length === 0 ? (
                <Typography variant="body1" sx={{ mt: 2 }}>
                  No addresses yet. Add your first address.
                </Typography>
              ) : (
                addresses.map((address) => (
                  <Card key={address.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle1">
                        {address.street}
                      </Typography>
                      <Typography variant="body2">
                        {address.city}, {address.state} {address.postal_code}
                      </Typography>
                      <Typography variant="body2">
                        {address.country}
                      </Typography>
                      {address.is_default && (
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                          Default Address
                        </Typography>
                      )}
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <IconButton size="small" onClick={() => handleEditAddress(address)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteAddress(address.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Address Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {editMode ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Street"
              name="street"
              value={currentAddress.street}
              onChange={handleAddressChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={currentAddress.city}
              onChange={handleAddressChange}
              margin="normal"
              required
              inputProps={{ pattern: '[a-zA-Z\\s]+' }}
              error={!!addressErrors.city}
              helperText={addressErrors.city || 'Letters only'}
            />
            <TextField
              fullWidth
              label="State"
              name="state"
              value={currentAddress.state}
              onChange={handleAddressChange}
              margin="normal"
              required
              inputProps={{ pattern: '[a-zA-Z\\s]+' }}
              error={!!addressErrors.state}
              helperText={addressErrors.state || 'Letters only'}
            />
            <TextField
              fullWidth
              label="Postal Code"
              name="postal_code"
              value={currentAddress.postal_code}
              onChange={handleAddressChange}
              margin="normal"
              required
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]{5}' }}
              error={!!addressErrors.postal_code}
              helperText={addressErrors.postal_code || 'Must be exactly 5 digits'}
            />
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={currentAddress.country}
              onChange={handleAddressChange}
              margin="normal"
              required
              inputProps={{ pattern: '[a-zA-Z\\s]+' }}
              error={!!addressErrors.country}
              helperText={addressErrors.country || 'Letters only'}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Set as default address
              </Typography>
              <input
                type="checkbox"
                name="is_default"
                checked={currentAddress.is_default}
                onChange={handleAddressChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveAddress} 
              variant="contained" 
              color="primary"
              disabled={!!addressErrors.postal_code || !!addressErrors.city || !!addressErrors.state || !!addressErrors.country}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default Profile; 
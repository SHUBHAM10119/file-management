import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const auth = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/token', formData);
    localStorage.setItem('token', response.data.access_token);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },
  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear the token from localStorage
      localStorage.removeItem('token');
    }
  },
};

export const files = {
  upload: async (file, onProgressUpdate = null, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add replace_existing flag if provided in options
    if (options.replaceExisting) {
      formData.append('replace_existing', 'true');
      console.log('Adding replace_existing=true to request');
    } else {
      formData.append('replace_existing', 'false');
    }
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      timeout: 60000,
    };
    
    if (onProgressUpdate && typeof onProgressUpdate === 'function') {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgressUpdate(percentCompleted);
      };
    }
    
    try {
      console.log('Using token for upload:', localStorage.getItem('token'));
      console.log('Upload options:', options);
      const response = await api.post('/upload/', formData, config);
      return response.data;
    } catch (error) {
      console.error('Upload error details:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw error;
      } else if (error.request) {
        console.error('No response received');
        throw new Error('No response from server. Check your network connection.');
      } else {
        console.error('Error message:', error.message);
        throw error;
      }
    }
  },
  list: async () => {
    const response = await api.get('/files/');
    return response.data;
  },
  download: async (fileId) => {
    const response = await api.get(`/files/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export const user = {
  getProfile: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
  updateProfile: async (userData) => {
    const response = await api.put('/users/me/', userData);
    return response.data;
  },
  getAddresses: async () => {
    const response = await api.get('/users/me/addresses/');
    return response.data;
  },
  createAddress: async (addressData) => {
    const response = await api.post('/users/me/addresses/', addressData);
    return response.data;
  },
  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/users/me/addresses/${addressId}`, addressData);
    return response.data;
  },
  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/me/addresses/${addressId}`);
    return response.data;
  },
}; 
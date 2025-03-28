import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Backdrop,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon, Upload as UploadIcon } from '@mui/icons-material';
import api, { files } from '../services/api';

function Dashboard() {
  const [filesList, setFilesList] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  // File duplicate handling state
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [duplicateFilename, setDuplicateFilename] = useState('');

  useEffect(() => {
    fetchFiles();
    fetchStats();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await api.get('/files/');
      console.log('Files data from API:', response.data);
      
      // Check the actual structure of the first file (if available)
      if (response.data.length > 0) {
        console.log('Sample file object:', response.data[0]);
        console.log('File upload_date:', response.data[0].upload_date);
      }
      
      setFilesList(response.data);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to fetch files');
      }
    }
  };

  // Format the date according to user's timezone
  const formatDate = (dateString) => {
    if (!dateString) {
      console.error('No date string provided');
      return 'Date not available';
    }
    
    console.log('Date string received:', dateString);
    
    try {
      // Handle ISO format string or timestamp number
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error('Invalid date created from string:', dateString);
        return 'Invalid date format';
      }
      
      // Get user's locale from browser
      const userLocale = navigator.language || navigator.userLanguage || 'en-US';
      
      return date.toLocaleString(userLocale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'for input:', dateString);
      return 'Invalid date';
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/files/${fileId}`);
      fetchFiles();
      showSuccessNotification('File deleted successfully');
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else {
        setError('Failed to delete file');
      }
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      setIsUploading(true); // Show loading indicator
      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob',
      });
      setIsUploading(false); // Hide loading indicator
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showSuccessNotification('File downloaded successfully');
    } catch (err) {
      setIsUploading(false); // Hide loading indicator
      if (err.response?.data?.detail) {
        setError(String(err.response.data.detail));
      } else {
        setError('Failed to download file');
      }
    }
  };

  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Store the file reference for potential later use (if duplicate)
    setCurrentFile(file);

    // Check if file with same name already exists
    const duplicateFile = filesList.find(f => f.filename === file.filename);
    if (duplicateFile) {
      setDuplicateFilename(file.filename);
      setDuplicateDialogOpen(true);
      // Clear file input so the same file can be selected again if needed
      event.target.value = '';
      return;
    }

    await uploadFile(file);
  };
  
  // New method to handle file upload after duplicate check
  const uploadFile = async (file, replaceExisting = false) => {
    try {
      // Reset state
      setUploadProgress(0);
      setError('');
      setIsUploading(true);
      
      // Add replace flag to request if replacing existing file
      const options = replaceExisting ? { replaceExisting: true } : {};
      
      // Use the files API service with progress tracking
      const fileData = await files.upload(file, (progress) => {
        setUploadProgress(progress);
      }, options);
      
      // Update state with new file
      setFilesList([...filesList, fileData]);
      
      // Show success notification
      showSuccessNotification(replaceExisting ? 'File replaced successfully!' : 'File uploaded successfully!');
      
      // Fetch updated stats
      fetchStats();
      
    } catch (err) {
      console.error('Upload error:', err);
      
      // Handle error messages
      if (err.response) {
        // Check for duplicate filename error (status 400)
        if (err.response.status === 400 && err.response.data.detail) {
          // This likely includes our duplicate filename message
          setError(err.response.data.detail);
        } else if (err.response.data.detail) {
          setError(String(err.response.data.detail));
        } else {
          setError('Server error: ' + (err.response.status || 'unknown error'));
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to upload file. Please check your connection and try again.');
      }
    } finally {
      setIsUploading(false);
      
      // Always refresh files list to ensure UI is in sync with server
      fetchFiles();
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1500);
    }
  };

  // Handle duplicate file dialog actions
  const handleReplace = () => {
    setDuplicateDialogOpen(false);
    if (currentFile) {
      uploadFile(currentFile, true);
    }
  };
  
  const handleCancelUpload = () => {
    setDuplicateDialogOpen(false);
    setCurrentFile(null);
    setDuplicateFilename('');
  };

  const closeSnackbar = () => {
    setShowSnackbar(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, position: 'relative' }}>
        {/* Success notification */}
        <Snackbar 
          open={showSnackbar} 
          autoHideDuration={3000} 
          onClose={closeSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={closeSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
        
        {/* Duplicate File Dialog */}
        <Dialog
          open={duplicateDialogOpen}
          onClose={handleCancelUpload}
          aria-labelledby="duplicate-dialog-title"
          aria-describedby="duplicate-dialog-description"
        >
          <DialogTitle id="duplicate-dialog-title">
            {"File Already Exists"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="duplicate-dialog-description">
              A file named <strong>{duplicateFilename}</strong> already exists in your files. 
              Would you like to replace the existing file, or cancel this upload?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelUpload} color="primary">
              Cancel Upload
            </Button>
            <Button onClick={handleReplace} color="error" autoFocus>
              Replace Existing File
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isUploading && uploadProgress === 0}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          
          {/* Stats Section */}
          {stats && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>Total Files</Typography>
                    <Typography variant="h3">{stats.total_files}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>File Types</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(stats.file_type_breakdown).map(([type, count]) => (
                        <Grid item xs={6} key={type}>
                          <Typography>
                            {type}: {count}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%', minHeight: 200, display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>Files per User</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(stats.files_per_user).map(([user, count]) => (
                        <Grid item xs={12} key={user}>
                          <Typography>
                            {user}: {count}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* File Upload Section */}
          <Box sx={{ mb: 3 }}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadIcon />}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload File'}
              </Button>
            </label>
            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                    }
                  }}
                />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {Math.round(uploadProgress)}% uploaded
                </Typography>
              </Box>
            )}
            
            {/* Error message moved here to appear right after upload button */}
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2,
                  // Make duplicate filename errors more prominent
                  ...(error.includes('already exists') && {
                    fontWeight: 'bold',
                    bgcolor: '#ffebee',
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem'
                    }
                  })
                }}
              >
                {error}
              </Alert>
            )}
          </Box>

          {/* Files List */}
          <Typography variant="h6" gutterBottom>
            Your Files
          </Typography>
          <List>
            {filesList.length > 0 ? (
              filesList.map((file) => (
                <ListItem key={file.id}>
                  <ListItemText
                    primary={file.filename}
                    secondary={
                      <>
                        <span>Type: {file.file_type}</span>
                        <br />
                        <span>Uploaded: {formatDate(file.upload_date)}</span>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="download"
                      onClick={() => handleDownload(file.id, file.filename)}
                      sx={{ mr: 1 }}
                      disabled={isUploading}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(file.id)}
                      disabled={isUploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No files uploaded yet. Use the upload button to add your first file.
              </Typography>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

export default Dashboard; 
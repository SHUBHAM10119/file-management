import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { files } from '../services/api';
import { CloudUpload } from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  const [fileList, setFileList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filesData, statsData] = await Promise.all([
        files.list(),
        files.getStats(),
      ]);
      setFileList(filesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await files.upload(file);
        fetchData();
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const columns = [
    { field: 'filename', headerName: 'Filename', width: 300 },
    { field: 'file_type', headerName: 'Type', width: 130 },
    {
      field: 'upload_date',
      headerName: 'Upload Date',
      width: 200,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleDownload(params.row.id)}
        >
          Download
        </Button>
      ),
    },
  ];

  const handleDownload = async (fileId) => {
    try {
      const blob = await files.download(fileId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileList.find((f) => f.id === fileId).filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
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
        {/* File Upload Button */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            sx={{ mb: 3 }}
          >
            Upload File
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".pdf,.xlsx,.xls,.txt,.doc,.docx"
            />
          </Button>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Total Files
            </Typography>
            <Typography variant="h4">{stats?.total_files}</Typography>
          </Paper>
        </Grid>

        {/* File Type Breakdown Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              File Type Breakdown
            </Typography>
            <Box sx={{ height: 300 }}>
              <PieChart width={600} height={300}>
                <Pie
                  data={Object.entries(stats?.file_type_breakdown || {}).map(
                    ([name, value]) => ({ name, value })
                  )}
                  cx={300}
                  cy={150}
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(stats?.file_type_breakdown || {}).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Box>
          </Paper>
        </Grid>

        {/* Files per User Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Files per User
            </Typography>
            <Box sx={{ height: 300 }}>
              <BarChart
                width={800}
                height={300}
                data={Object.entries(stats?.files_per_user || {}).map(
                  ([name, value]) => ({ name, value })
                )}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </Box>
          </Paper>
        </Grid>

        {/* File List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Files
            </Typography>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={fileList}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 
import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, Box, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, FormControlLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState({ jobTitle: '', companyName: '', sponsored: '' });
  const [openDialog, setOpenDialog] = useState(false);
  const [jobToUpdate, setJobToUpdate] = useState(null);
  const [newJobData, setNewJobData] = useState({ jobTitle: '', companyName: '', sponsored: '' });

  const features = [
    {
      title: 'Job Visualization',
      description: 'Explore job market trends and insights',
      path: '/visualization',
    },
    {
      title: 'Upload Job Data',
      description: 'Contribute to our job database',
      path: '/upload',
    },
    {
      title: 'Favorite Jobs',
      description: 'View and manage your favorite jobs',
      path: '/favorites',
    },
  ];

  // Fetch all jobs
  const fetchJobs = async (filters = {}) => {
    try {
      const userID = localStorage.getItem('user_id');  // Get user_id from localStorage
      if (!userID) {
        console.error('User is not logged in.');
        return;
      }
      const response = await api.getJobs(userID,filters);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Handle search
  const handleSearch = async () => {
    const filters = {
      jobTitle: search.jobTitle,
      companyName: search.companyName,
      sponsored: search.sponsored,
    };
    fetchJobs(filters);
  };

  // Update job data
  const handleUpdateJob = async () => {
    try {
      const updatedJob = { ...jobToUpdate, ...newJobData };
      await api.updateJob(updatedJob);
      setOpenDialog(false);
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  // Delete job
  const handleDeleteJob = async (jobId) => {
    try {
      await api.deleteJob(jobId);
      fetchJobs(); // Refresh job list after deletion
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = async (jobId, isFavorite) => {
    try {
      const userID = localStorage.getItem('user_id');
      await api.updateFavoriteStatus({ user_id: userID, job_id: jobId, isf: isFavorite});
      fetchJobs();
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  useEffect(() => {
    fetchJobs(); // Fetch all jobs on component mount
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      {/* Features */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {features.map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {feature.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(feature.path)}
                >
                  Explore
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search Box */}
      <Box sx={{ mb: 4 }}>
        <TextField
          label="Job Title"
          variant="outlined"
          value={search.jobTitle}
          onChange={(e) => setSearch({ ...search, jobTitle: e.target.value })}
          sx={{ marginRight: 2 }}
        />
        <TextField
          label="Company Name"
          variant="outlined"
          value={search.companyName}
          onChange={(e) => setSearch({ ...search, companyName: e.target.value })}
          sx={{ marginRight: 2 }}
        />
        <TextField
          label="Sponsored"
          variant="outlined"
          value={search.sponsored}
          onChange={(e) => setSearch({ ...search, sponsored: e.target.value })}
          sx={{ marginRight: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Job List Table */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company Name</th>
                <th>Sponsored</th>
                <th>Salary</th>
                <th>Rating</th>
                <th>Favorite</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.JobID}>
                  <td>{job.JobTitle}</td>
                  <td>{job.CompanyName}</td>
                  <td>{job.Sponsored ? 'Yes' : 'No'}</td>
                  <td>{job.Salary}</td>
                  <td>{job.Rating}</td>
                  <td>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={job.isFavorite || false} // Use the favorite status from the job
                          onChange={() => handleToggleFavorite(job.JobID, job.isFavorite)}
                        />
                      }
                      label="Favorite"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Grid>
      </Grid>

      {/* Update Job Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Job</DialogTitle>
        <DialogContent>
          <TextField
            label="Job Title"
            variant="outlined"
            value={newJobData.jobTitle}
            onChange={(e) => setNewJobData({ ...newJobData, jobTitle: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Company Name"
            variant="outlined"
            value={newJobData.companyName}
            onChange={(e) => setNewJobData({ ...newJobData, companyName: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Sponsored"
            variant="outlined"
            value={newJobData.sponsored}
            onChange={(e) => setNewJobData({ ...newJobData, sponsored: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateJob} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;

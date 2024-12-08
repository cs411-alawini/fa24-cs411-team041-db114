import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Typography, Button, Card, CardContent, CardActions,FormControlLabel,Checkbox } from '@mui/material';
import { api } from '../services/api';

function FavoriteJobs() {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const userID = localStorage.getItem('user_id');

  // Fetch favorite jobs (assuming the API has a specific route for favorite jobs)
  const fetchFavoriteJobs = async () => {
    try {
      const response = await api.getFavoriteJob(userID); // Pass userID
      setFavoriteJobs(response.data); // Set the fetched jobs to the state
    } catch (error) {
      console.error('Error fetching favorite jobs:', error);
    }
  };

  const handleToggleFavorite = async (jobId, isFavorite) => {
    try {
      const userID = localStorage.getItem('user_id');
      await api.updateFavoriteStatus({ user_id: userID, job_id: jobId, isf: isFavorite});
      fetchFavoriteJobs();
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };
  const fetchRecommendedJobs = async () => {
    try {
      const response = await api.getRecommendedJobs(userID); // API for recommended jobs
      setRecommendedJobs(response.data); // Limit to 3 jobs
    } catch (error) {
      console.error('Error fetching recommended jobs:', error);
    }
  };
  useEffect(() => {
    fetchFavoriteJobs(); // Load favorite jobs when the component is mounted
    fetchRecommendedJobs();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
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
              {favoriteJobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.JobTitle}</td>
                  <td>{job.CompanyName}</td>
                  <td>{job.Sponsored ? 'Yes' : 'No'}</td>
                  <td>{job.Salary}</td>
                  <td>{job.Rating}</td>
                  <td>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={job.isFavorite || false} 
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
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Recommended for You
        </Typography>
        <Grid container spacing={2}>
          {recommendedJobs.map((job) => (
            <Grid item xs={12} sm={4} key={job.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{job.JobTitle}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {job.CompanyName}
                  </Typography>
                  <Typography variant="body2">
                    Salary: {job.Salary}
                  </Typography>
                  <Typography variant="body2">
                    Rating: {job.Rating}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color={job.isFavorite ? 'secondary' : 'primary'}
                    onClick={() => handleToggleFavorite(job.JobID, job.isFavorite)}
                  >
                    {job.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default FavoriteJobs;

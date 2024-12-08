import React, { useState, useEffect } from 'react';
import { Container, Grid, Box } from '@mui/material';
import { api } from '../services/api';

function FavoriteJobs() {
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const userID = localStorage.getItem('user_id');

  // Fetch favorite jobs (assuming the API has a specific route for favorite jobs)
  const fetchFavoriteJobs = async (filters = {}) => {
    try {
      const response = await api.getFavoriteJob(filters);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchFavoriteJobs(); // Load favorite jobs when the component is mounted
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
                </tr>
              ))}
            </tbody>
          </table>
        </Grid>
      </Grid>
    </Container>
  );
}

export default FavoriteJobs;

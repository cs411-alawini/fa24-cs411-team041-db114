import React, { useEffect, useState } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { api } from '../services/api';

function AdminDashboard() {
  const [pendingJobs, setPendingJobs] = useState([]);

  const fetchPendingJobs = async () => {
    try {
      const response = await api.getPendingJobs();
      setPendingJobs(response.data);
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
    }
  };

  const handleAction = async (jobId, action) => {
    try {
      await api.approveJob(jobId, action);
      fetchPendingJobs(); // update the list
    } catch (error) {
      console.error('Error processing job:', error);
    }
  };

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Pending Jobs
      </Typography>
      <Grid container spacing={4}>
        {pendingJobs.map((job) => (
          <Grid item xs={12} key={job.JobID}>
            <Card>
              <CardContent>
                <Typography variant="h5">{job.JobTitle}</Typography>
                <Typography variant="subtitle1">{job.CompanyName}</Typography>
                <Typography variant="body2">{job.JobSnippet}</Typography>
                <Button color="primary" onClick={() => handleAction(job.JobID, 'accept')}>
                  Accept
                </Button>
                <Button color="secondary" onClick={() => handleAction(job.JobID, 'reject')} sx={{ ml: 2 }}>
                  Reject
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default AdminDashboard;

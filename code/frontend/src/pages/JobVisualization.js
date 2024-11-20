import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import api from '../services/api';

function JobTable() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await api.getJobs();
      setJobs(response.data);
    };
    fetchJobs();
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Posted Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((job, index) => (
                    <TableRow key={index}>
                      <TableCell>{job.JobTitle}</TableCell>
                      <TableCell>{job.CompanyName}</TableCell>
                      <TableCell>{job.Rating}</TableCell>
                      <TableCell>{new Date(job.postedDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default JobTable;

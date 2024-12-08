import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, FormControlLabel } from '@mui/material';
import { api } from '../services/api';

function JobUpload() {
  const [jobData, setJobData] = useState({
    jobTitle: '',
    jobSnippet: '',
    jobLink: '',
    sponsored: false,
    salary: '',
    rating: '',
    companyName: '',
  });
  const [uploadHistory, setUploadHistory] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const userID = localStorage.getItem('user_id');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setJobData({ ...jobData, sponsored: checked });
  };

  const handleUpload = async () => {
    try {
      await api.uploadJob({ ...jobData, userID });
      alert('Job uploaded successfully!');
      fetchUploadHistory();
    } catch (error) {
      alert('Failed to upload job. Please try again.');
    }
  };

  const fetchUploadHistory = async () => {
    try {
      const response = await api.getUploadHistory(userID);
      setUploadHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch upload history', error);
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setJobData(job);
  };

  const handleUpdate = async () => {
    try {
      await api.updateJob(jobData);
      alert('Job updated successfully!');
      setEditingJob(null);
      fetchUploadHistory();
    } catch (error) {
      alert('Failed to update job. Please try again.');
    }
  };

  useEffect(() => {
    fetchUploadHistory();
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Job Upload
      </Typography>
      <Box>
        {['jobTitle', 'jobSnippet', 'jobLink', 'salary', 'rating', 'companyName'].map((field) => (
          <TextField
            key={field}
            label={field.replace(/([A-Z])/g, ' $1')}
            name={field}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={jobData[field]}
            onChange={handleInputChange}
          />
        ))}
        <FormControlLabel
          control={
            <Checkbox
              checked={jobData.sponsored}
              onChange={handleCheckboxChange}
              name="sponsored"
            />
          }
          label="Sponsored"
        />
        <Button variant="contained" color="primary" onClick={editingJob ? handleUpdate : handleUpload}>
          {editingJob ? 'Update' : 'Upload'}
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mt: 5 }}>
        Upload History
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Job Title</TableCell>
            <TableCell>Snippet</TableCell>
            <TableCell>Link</TableCell>
            <TableCell>Salary</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Admin Comment</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {uploadHistory.map((job) => (
            <TableRow key={job.JobID}>
              <TableCell>{job.JobTitle}</TableCell>
              <TableCell>{job.JobSnippet}</TableCell>
              <TableCell>
                <a href={job.JobLink} target="_blank" rel="noopener noreferrer">
                  {job.JobLink}
                </a>
              </TableCell>
              <TableCell>{job.Salary}</TableCell>
              <TableCell>{job.CompanyName}</TableCell>
              <TableCell>{job.AdminComment || 'N/A'}</TableCell>
              <TableCell>
                <Button variant="outlined" color="secondary" onClick={() => handleEdit(job)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}

export default JobUpload;

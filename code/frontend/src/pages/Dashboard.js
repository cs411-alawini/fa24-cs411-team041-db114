import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, TextField, Box, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function Dashboard() {
  const navigate = useNavigate();

  // 用于存储职位数据和搜索条件
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

  // 获取所有职位
  const fetchJobs = async (filters = {}) => {
    try {
      const response = await api.getJobs(filters);
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // 搜索功能
  const handleSearch = async () => {
    const filters = {
      jobTitle: search.jobTitle,
      companyName: search.companyName,
      sponsored: search.sponsored,
    };
    fetchJobs(filters);
  };

  // 更新职位信息
  const handleUpdateJob = async () => {
    try {
      const updatedJob = { ...jobToUpdate, ...newJobData };
      await api.updateJob(updatedJob);
      setOpenDialog(false);
      fetchJobs(); // 更新 job 列表
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  // 删除职位
  const handleDeleteJob = async (jobId) => {
    try {
      await api.deleteJob(jobId);
      fetchJobs(); // 删除后刷新 job 列表
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  useEffect(() => {
    fetchJobs(); // 组件加载时获取所有职位
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      {/* Features - 保持原有功能按钮 */}
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

      {/* 搜索框 */}
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

      {/* Job 列表 */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company Name</th>
                <th>Job Snippet</th>
                <th>Job Link</th>
                <th>Sponsored</th>
                <th>Salary</th>
                <th>Rating</th>
                <th>Actions</th> {/* 添加操作列 */}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.JobTitle}</td>
                  <td>{job.CompanyName}</td>
                  <td>{job.JobSnippet}</td>
                  <td>{job.JobLink}</td>
                  <td>{job.Sponsored ? 'Yes' : 'No'}</td>
                  <td>{job.Salary}</td>
                  <td>{job.Rating}</td>
                  <td>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setJobToUpdate(job);
                        setNewJobData({ jobTitle: job.jobTitle, companyName: job.companyName, sponsored: job.sponsored });
                        setOpenDialog(true);
                      }}
                    >
                      Update
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => handleDeleteJob(job.id)}
                      sx={{ ml: 2 }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Grid>
      </Grid>

      {/* 更新职位的弹窗 */}
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

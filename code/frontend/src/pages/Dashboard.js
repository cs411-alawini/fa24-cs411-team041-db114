import React from 'react';
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

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

  return (
    <Container sx={{ mt: 4 }}>
      <Grid container spacing={4}>
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
    </Container>
  );
}

export default Dashboard; 
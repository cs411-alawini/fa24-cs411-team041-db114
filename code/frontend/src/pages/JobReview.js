import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Rating, TextField, Button, Card, CardContent, Divider } from '@mui/material';
import { api } from '../services/api';

function JobReview() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, content: '' });
  const [job, setJob] = useState(null);

  useEffect(() => {
    fetchReviews();
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const userID = localStorage.getItem('user_id');
      const response = await api.getJobs(userID);
      const jobDetails = response.data.find(job => job.JobID === jobId);
      setJob(jobDetails);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.getReviews(jobId);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await api.addReview({
        jobId: jobId,
        content: newReview.content,
        rating: newReview.rating
      });
      
      // Clear form and refresh reviews
      setNewReview({ rating: 0, content: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {job && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Reviews for {job.JobTitle}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {job.CompanyName}
          </Typography>
        </Box>
      )}

      {/* Add Review Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add Your Review
          </Typography>
          <Rating
            value={newReview.rating}
            onChange={(event, newValue) => {
              setNewReview(prev => ({ ...prev, rating: newValue }));
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Your Review"
            value={newReview.content}
            onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitReview}
            disabled={!newReview.rating || !newReview.content}
          >
            Submit Review
          </Button>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Typography variant="h6" gutterBottom>
        All Reviews ({reviews.length})
      </Typography>
      {reviews.length === 0 ? (
        <Typography color="text.secondary">
          No reviews yet. Be the first to review!
        </Typography>
      ) : (
        reviews.map((review) => (
          <Card key={review.ReviewID} sx={{ mb: 2 }}>
            <CardContent>
              <Rating value={review.Rating} readOnly sx={{ mb: 1 }} />
              <Typography variant="body1">
                {review.Content}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      <Button
        variant="outlined"
        onClick={() => navigate(-1)}
        sx={{ mt: 2 }}
      >
        Back to Jobs
      </Button>
    </Container>
  );
}

export default JobReview; 
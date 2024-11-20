import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
  getJobs: (searchParams) => axios.get(`${API_URL}/jobs`, { params: searchParams }),
  updateJob: (job) => axios.put(`${API_URL}/jobs/${job.id}`, job),
  deleteJob: (jobId) => axios.delete(`${API_URL}/jobs/${jobId}`),
  submitJob: (job) => axios.post(`${API_URL}/jobs/submit`, job),
  getFavorites: () => axios.get(`${API_URL}/favorites`),
  addToFavorites: (job) => axios.post(`${API_URL}/favorites`, job),
  getRecommendations: () => axios.get(`${API_URL}/recommendations`),
};

export default api; 
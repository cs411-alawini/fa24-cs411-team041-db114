import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
  getJobs: () => axios.get(`${API_URL}/jobs`),
  submitJob: (job) => axios.post(`${API_URL}/jobs/submit`, job),
  getFavorites: () => axios.get(`${API_URL}/favorites`),
  addToFavorites: (job) => axios.post(`${API_URL}/favorites`, job),
  getRecommendations: () => axios.get(`${API_URL}/recommendations`),
};

export default api; 
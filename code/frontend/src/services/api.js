import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const api = {
  getJobs: (userID,searchParams) => axios.get(`${API_URL}/jobs/${userID}`, { params: searchParams }),
  updateFavoriteStatus: (data) => axios.post(`${API_URL}/updateFavoriteStatus`, data),
  updateJob: (job) => axios.put(`${API_URL}/jobs/${job.id}`, job),
  deleteJob: (jobId) => axios.delete(`${API_URL}/jobs/${jobId}`),
  submitJob: (job) => axios.post(`${API_URL}/jobs/submit`, job),
  getFavorites: () => axios.get(`${API_URL}/favorites`),
  addToFavorites: (job) => axios.post(`${API_URL}/favorites`, job),
  getRecommendations: () => axios.get(`${API_URL}/recommendations`),
  login: (credentials) => axios.post(`${API_URL}/login`, credentials),
  register: (data) => axios.post(`${API_URL}/register`, data),
  getPendingJobs: () => axios.get(`${API_URL}/admin/pending-jobs`),
  approveJob: (jobId, action) => axios.post(`${API_URL}/admin/approve-job/${jobId}`, { action }),
  uploadJob: (data) => axios.post(`${API_URL}/upload-job`, data),
  getUploadHistory: (userID) => axios.get(`${API_URL}/upload-history/${userID}`),
  updateJob: (data) => axios.post(`${API_URL}/update-job`, data),
  getFavoriteJob: (userID) => axios.get(`${API_URL}/FavoriteJob/${userID}`),
};

export default api; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './pages/Dashboard';
import JobVisualization from './pages/JobVisualization';
import JobUpload from './pages/JobUpload';
import FavoriteJobs from './pages/FavoriteJobs';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login/user" element={<Login isAdmin={false} />} />
          <Route path="/login/admin" element={<Login isAdmin={true} />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/visualization" element={<JobVisualization />} />
          <Route path="/upload" element={<JobUpload />} />
          <Route path="/favorites" element={<FavoriteJobs />} />
          {/* <Route path="*" element={<Navigate to="/login/user" />} /> */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 
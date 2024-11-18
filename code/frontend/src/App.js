import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './pages/Dashboard';
import JobVisualization from './pages/JobVisualization';
import JobUpload from './pages/JobUpload';
import FavoriteJobs from './pages/FavoriteJobs';
import Navbar from './components/Navbar';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/visualization" element={<JobVisualization />} />
          <Route path="/upload" element={<JobUpload />} />
          <Route path="/favorites" element={<FavoriteJobs />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 
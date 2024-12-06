import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function JobVisualization() {
  const [jobStats, setJobStats] = useState({
    salaryData: null,
    locationData: null,
    jobTypeData: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('salary');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchJobStats();
  }, []);

  const fetchJobStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/job-stats');
      const data = await response.json();
      console.log('Received data:', data);
      if (data.error) {
        setError(data.error);
      } else {
        setJobStats(data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching job stats:', err);
      setError('Failed to fetch job statistics');
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2)); // Max zoom: 2x
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5)); // Min zoom: 0.5x
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const salaryChartConfig = {
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Salary Distribution by Job Title',
        },
      },
    },
    data: jobStats.salaryData || {
      labels: [],
      datasets: [{
        label: 'Average Salary',
        data: [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }],
    },
  };

  const locationChartConfig = {
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: {
          display: true,
          text: 'Job Distribution by Company',
        },
      },
    },
    data: jobStats.locationData || {
      labels: [],
      datasets: [{
        label: 'Number of Jobs by Company',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }],
    },
  };

  const jobTypeChartConfig = {
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: { 
          position: 'right',
          labels: {
            boxWidth: 20,
          }
        },
        title: {
          display: true,
          text: 'Job Distribution by Title',
        },
      },
    },
    data: jobStats.jobTypeData || {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      }],
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Job Market Analytics</h1>
      
      <div className="flex items-center gap-4 mb-4">
        <select
          className="p-2 border rounded"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="salary">Salary Distribution</option>
          <option value="location">Company Distribution</option>
          <option value="jobType">Job Title Distribution</option>
        </select>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Zoom Out"
          >
            -
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Reset Zoom"
          >
            Reset
          </button>
          <button
            onClick={handleZoomIn}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Zoom In"
          >
            +
          </button>
          <span className="text-sm text-gray-600">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      <div 
        className="w-full max-w-4xl mx-auto transition-transform duration-200"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
      >
        {chartType === 'salary' && (
          <Bar options={salaryChartConfig.options} data={salaryChartConfig.data} />
        )}
        {chartType === 'location' && (
          <Bar options={locationChartConfig.options} data={locationChartConfig.data} />
        )}
        {chartType === 'jobType' && (
          <div className="max-w-2xl mx-auto">
            <Pie options={jobTypeChartConfig.options} data={jobTypeChartConfig.data} />
          </div>
        )}
      </div>
    </div>
  );
}

export default JobVisualization;

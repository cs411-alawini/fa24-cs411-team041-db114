import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { api } from '../services/api';

function Login({ isAdmin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    age: '',
    location: '',
    phoneNumber: '',
    emailAddress: '',
  });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await api.login({ username, password, isAdmin });
      if (response.data.success) {
        localStorage.setItem('user_id', response.data.user_id); // user_id !!! in local storage!!!
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await api.register(registerData);
      if (response.data.success) {
        alert('User registered successfully! You can now log in.');
        setRegisterData({
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          age: '',
          location: '',
          phoneNumber: '',
          emailAddress: '',
        });
      }
    } catch (error) {
      alert('Registration failed. Please check your input.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {isAdmin ? 'Admin Login' : 'User Login'}
      </Typography>
      <Box>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
      </Box>

      <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
        Create New User
      </Typography>
      <Box>
        {['username', 'password', 'firstName', 'lastName', 'age', 'location', 'phoneNumber', 'emailAddress'].map(
          (field) => (
            <TextField
              key={field}
              label={field.replace(/([A-Z])/g, ' $1')}
              name={field}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              value={registerData[field]}
              onChange={handleInputChange}
            />
          )
        )}
        <Button variant="contained" color="secondary" onClick={handleRegister}>
          Register
        </Button>
      </Box>
    </Container>
  );
}

export default Login;

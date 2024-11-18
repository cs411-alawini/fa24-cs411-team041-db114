# Setup Guide

This guide will help you set up both the frontend and backend components of the project.

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```bash
     .venv\Scripts\activate
     ```
   - Mac/Linux:
     ```bash
     source .venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```bash
   python app.py
   ```
   The server will start running on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
   The application will open in your browser at `http://localhost:3000`

## Development Notes

- Backend API endpoints are available at `http://localhost:5000/api`
- Make sure both backend and frontend servers are running simultaneously for full functionality
- The backend requires Python 3.8 or higher
- The frontend requires Node.js 14 or higher 
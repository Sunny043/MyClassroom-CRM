const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Import database connection
require('./backend/database/db');

// Configure middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || true 
    : 'http://localhost:3000',
  credentials: true
}));

// Import routes
const studentRoutes = require('./backend/routes/student.route');
const branchRoutes = require('./backend/routes/branch.route');
const { router: authRoutes } = require('./backend/routes/auth.route');

// API Routes
app.use('/students', studentRoutes);
app.use('/branches', branchRoutes);
app.use('/auth', authRoutes);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'MyClassroom CRM API Server',
      status: 'Running',
      environment: 'development',
      endpoints: {
        auth: '/auth',
        students: '/students', 
        branches: '/branches'
      }
    });
  });
}

// Port configuration (Render uses PORT environment variable)
const port = process.env.PORT || 10000;

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log('🚀 Server started on port', port);
  console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
  
  if (process.env.NODE_ENV === 'production') {
    console.log('📦 Serving React build from /build directory');
  } else {
    console.log('🔧 Development mode - API only');
    console.log('💡 Frontend should be running separately on port 3000');
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('🚨 Server Error:', error);
  console.error('🔍 Error stack:', error.stack);
  console.error('📍 Request URL:', req.url);
  console.error('📋 Request method:', req.method);
  console.error('📦 Request body:', req.body);
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

module.exports = app;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { db } = require('./database/db'); // Import the MongoDB URI from db.js

// Import routes
const studentRoute = require('./routes/student.route');
const branchRoute = require('./routes/branch.route');
const { router: authRoute } = require('./routes/auth.route');

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
mongoose.connect(db)
  .then(() => {
    console.log('Database successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('Could not connect to database:', error.message);
    process.exit(1); // Exit the process if the database connection fails
  });

// Routes
app.use('/auth', authRoute);
app.use('/students', studentRoute);
app.use('/branches', branchRoute);

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// PORT
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Connected to port ${port}`);
});

// Remove the inline routes and schema since we're using the separate files now

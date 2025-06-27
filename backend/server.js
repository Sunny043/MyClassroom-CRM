const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { db } = require('./db'); // Import the MongoDB URI from db.js

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// MongoDB Connection
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Da+tabase successfully connected!');
  })
  .catch((error) => {
    console.error('Could not connect to database:', error.message);
    process.exit(1); // Exit the process if the database connection fails
  });

// Define the Student Schema and Model
const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'], // Custom error message
  },
  email: {
    type: String,
    required: [true, 'Email is required'], // Custom error message
    unique: true,   // Email must be unique
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'], // Custom error message
  },
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const Student = mongoose.model('Student', StudentSchema);

// Routes

// Create a new student
app.post('/students/create', async (req, res) => {
  try {
    const { name, email, rollNo } = req.body;

    // Validate the input
    if (!name || !email || !rollNo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new student
    const newStudent = new Student({ name, email, rollNo });
    await newStudent.save();

    res.status(201).json({ message: 'Student created successfully', student: newStudent });
  } catch (error) {
    console.error('Error creating student:', error);

    // Handle duplicate key error (e.g., unique email)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Fetch all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find(); // Fetch all students from the database
    res.status(200).json(students); // Return the students as a JSON response
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// PORT
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Connected to port ${port}`);
});
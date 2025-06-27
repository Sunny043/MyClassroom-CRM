// Load environment variables if .env file exists
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB Atlas connection string
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://bojjasunny21:YOUR_PASSWORD_HERE@reactdb.q1f7tls.mongodb.net/myClassroomCRM?retryWrites=true&w=majority&appName=reactdb';

console.log('🔗 Connecting to MongoDB...');
console.log('📍 Database URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//[username]:[password]@')); // Hide password in logs

// Connect to MongoDB with error handling
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
  console.error('🔍 Check your MONGODB_URI environment variable');
  process.exit(1);
});

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('🚨 Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('📤 Mongoose disconnected from MongoDB');
});

module.exports = {
  db: mongoURI
};

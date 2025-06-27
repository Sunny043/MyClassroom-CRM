// Load environment variables if .env file exists
require('dotenv').config();

// MongoDB Atlas connection string
// Replace <db_password> with your actual password or use environment variable
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://bojjasunny21:YOUR_PASSWORD_HERE@reactdb.q1f7tls.mongodb.net/myClassroomCRM?retryWrites=true&w=majority&appName=reactdb';

module.exports = {
  db: mongoURI
};

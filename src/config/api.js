// API Base URL Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // In production, API calls will be made to the same domain
  : 'http://localhost:4000'; // In development, use local backend

export default API_BASE_URL;

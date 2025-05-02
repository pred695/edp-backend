import axios from 'axios';

// Determine the base URL based on environment
const baseURL = 'http://localhost:3000/api'; // Default to localhost
// Create an axios instance with default config
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication APIs
export const login = (credentials) => {
  return api.post('/users/login', credentials);
};

export const signup = (userData) => {
  return api.post('/users/signup', userData);
};

export const logout = () => {
  return api.get('/users/logout');
};

// User APIs
export const getUserInfo = () => {
  return api.get('/users/info');
};

// Item APIs
export const getItems = (params) => {
  return api.get('/items', { params });
};

export const getItemById = (id) => {
  return api.get(`/items/${id}`);
};

// Add more API functions as needed

export default api;
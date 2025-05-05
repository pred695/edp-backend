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

// RFID APIs
export const registerRfid = (rfidData) => {
  return api.post('/rfid/register', rfidData);
};

export const getRfidTags = () => {
  return api.get('/rfid');
};

export const deleteRfid = (rfid) => {
  return api.delete(`/rfid/${rfid}`);
};

// Video APIs
export const getVideos = (params) => {
  return api.get('/videos', { params });
};

export const getVideoById = (id) => {
  return api.get(`/videos/${id}`);
};

export const uploadVideo = (formData, onProgress) => {
  return api.post('/videos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
};

export const updateVideoStatus = (id, data) => {
  return api.put(`/videos/${id}`, data);
};

export const deleteVideo = (id) => {
  return api.delete(`/videos/${id}`);
};

// Video streaming helper
export const getVideoStreamUrl = (id) => {
  return `${baseURL}/videos/${id}/stream`;
};

// ROI APIs
export const getRoiVideos = (params) => {
  return api.get('/roi', { params });
};

export const getRoiVideoById = (id) => {
  return api.get(`/roi/${id}`);
};

export const uploadRoiVideo = (formData, onProgress) => {
  return api.post('/roi', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
};

export const deleteRoiVideo = (id) => {
  return api.delete(`/roi/${id}`);
};

// ROI video streaming helper
export const getRoiVideoStreamUrl = (id) => {
  return `${baseURL}/roi/${id}/stream`;
};

// Logs APIs
export const getLogs = (params) => {
  return api.get('/logs', { params });
};

export const getLogById = (id) => {
  return api.get(`/logs/${id}`);
};

export const uploadLog = (formData, onProgress) => {
  return api.post('/logs', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: onProgress,
  });
};

export const deleteLog = (id) => {
  return api.delete(`/logs/${id}`);
};

export const getLogContentUrl = (id, download = false) => {
  return `${baseURL}/logs/${id}/content${download ? '?download=true' : ''}`;
};
export default api;
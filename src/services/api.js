import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://datacenter-water-clean-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadCSV = async (file, siteName = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (siteName) {
    formData.append('site_name', siteName);
  }

  const response = await api.post('/api/v1/analysis/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAnalysisHistory = async (limit = 20, offset = 0) => {
  const response = await api.get('/api/v1/analysis/history', {
    params: { limit, offset },
  });
  return response.data;
};

export const getAnalysisById = async (id) => {
  const response = await api.get(`/api/v1/analysis/${id}`);
  return response.data;
};

export const updateAnalysisNotes = async (id, userNotes) => {
  const response = await api.patch(`/api/v1/analysis/${id}/notes`, {
    user_notes: userNotes,
  });
  return response.data;
};

export default api;

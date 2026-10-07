import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

// Auth
export const authApi = {
  register: (data) => axiosInstance.post('/auth/register', data).then(r => r.data),
  login: (data) => axiosInstance.post('/auth/login', data).then(r => r.data),
  logout: () => axiosInstance.post('/auth/logout').then(r => r.data),
  getMe: () => axiosInstance.get('/auth/me').then(r => r.data),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data).then(r => r.data),
  getUsers: () => axiosInstance.get('/auth/users').then(r => r.data),
  updateUser: (id, data) => axiosInstance.put(`/auth/users/${id}`, data).then(r => r.data),
  deleteUser: (id) => axiosInstance.delete(`/auth/users/${id}`).then(r => r.data),
};

// Requests
export const requestApi = {
  getAll: (params) => axiosInstance.get('/requests', { params }).then(r => r.data),
  get: (id) => axiosInstance.get(`/requests/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/requests', data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/requests/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/requests/${id}`).then(r => r.data),
  send: (data) => axiosInstance.post('/requests/send', data).then(r => r.data),
  duplicate: (id) => axiosInstance.post(`/requests/${id}/duplicate`).then(r => r.data),
};

// Environments
export const environmentApi = {
  getAll: () => axiosInstance.get('/environments').then(r => r.data),
  get: (id) => axiosInstance.get(`/environments/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/environments', data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/environments/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/environments/${id}`).then(r => r.data),
};

// Collections
export const collectionApi = {
  getAll: () => axiosInstance.get('/collections').then(r => r.data),
  get: (id) => axiosInstance.get(`/collections/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/collections', data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/collections/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/collections/${id}`).then(r => r.data),
  // Folders
  createFolder: (collectionId, data) => axiosInstance.post(`/collections/${collectionId}/folders`, data).then(r => r.data),
  updateFolder: (collectionId, folderId, data) => axiosInstance.put(`/collections/${collectionId}/folders/${folderId}`, data).then(r => r.data),
  deleteFolder: (collectionId, folderId) => axiosInstance.delete(`/collections/${collectionId}/folders/${folderId}`).then(r => r.data),
};

// History
export const historyApi = {
  getAll: (params) => axiosInstance.get('/history', { params }).then(r => r.data),
  get: (id) => axiosInstance.get(`/history/${id}`).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/history/${id}`).then(r => r.data),
  clear: () => axiosInstance.delete('/history').then(r => r.data),
  rerun: (id) => axiosInstance.post(`/history/${id}/rerun`).then(r => r.data),
};

// Test Cases
export const testCaseApi = {
  getAll: (params) => axiosInstance.get('/testcases', { params }).then(r => r.data),
  get: (id) => axiosInstance.get(`/testcases/${id}`).then(r => r.data),
  create: (data) => axiosInstance.post('/testcases', data).then(r => r.data),
  update: (id, data) => axiosInstance.put(`/testcases/${id}`, data).then(r => r.data),
  delete: (id) => axiosInstance.delete(`/testcases/${id}`).then(r => r.data),
  run: (id) => axiosInstance.post(`/testcases/${id}/run`).then(r => r.data),
  getRuns: (id, params) => axiosInstance.get(`/testcases/${id}/runs`, { params }).then(r => r.data),
};

// Import/Export
export const importExportApi = {
  exportCollection: (id) => axiosInstance.get(`/import-export/export/collection/${id}`, { responseType: 'blob' }).then(r => r.data),
  exportEnvironment: (id) => axiosInstance.get(`/import-export/export/environment/${id}`, { responseType: 'blob' }).then(r => r.data),
  exportAll: () => axiosInstance.get('/import-export/export/all', { responseType: 'blob' }).then(r => r.data),
  importCollection: (data) => axiosInstance.post('/import-export/import/collection', data).then(r => r.data),
  importEnvironment: (data) => axiosInstance.post('/import-export/import/environment', data).then(r => r.data),
  importAll: (data) => axiosInstance.post('/import-export/import/all', data).then(r => r.data),
};

// Admin
export const adminApi = {
  getStats: () => axiosInstance.get('/admin/stats').then(r => r.data),
  getHealth: () => axiosInstance.get('/admin/health').then(r => r.data),
  getUsers: (params) => axiosInstance.get('/admin/users', { params }).then(r => r.data),
  createUser: (data) => axiosInstance.post('/admin/users', data).then(r => r.data),
  updateUser: (id, data) => axiosInstance.put(`/admin/users/${id}`, data).then(r => r.data),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`).then(r => r.data),
  getRequests: (params) => axiosInstance.get('/admin/requests', { params }).then(r => r.data),
  getCollections: (params) => axiosInstance.get('/admin/collections', { params }).then(r => r.data),
  getEnvironments: () => axiosInstance.get('/admin/environments').then(r => r.data),
  toggleGlobalEnvironment: (id) => axiosInstance.put(`/admin/environments/${id}/global`).then(r => r.data),
  deleteEnvironment: (id) => axiosInstance.delete(`/admin/environments/${id}`).then(r => r.data),
};

// Legacy compatibility
export const api = {
  getSaved: () => requestApi.getAll().then(r => r.requests || r),
  saveRequest: (body) => requestApi.create(body),
  updateRequest: (id, body) => requestApi.update(id, body),
  deleteRequest: (id) => requestApi.delete(id),
  sendRequest: (body) => requestApi.send(body),
};

export default api;
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BASE_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API Request:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// ... rest of your API functions remain the same
export const authAPI = {
  registerStudent: (userData) => api.post('/auth/register/student', userData),
  registerFaculty: (userData) => api.post('/auth/register/faculty', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// ... other API exports

// Subjects API
export const subjectsAPI = {
  getSubjects: () => api.get('/subjects'),
  createSubject: (subjectData) => api.post('/subjects', subjectData),
  getFacultySubjects: () => api.get('/subjects/faculty/my-subjects'),
  getStudentSubjects: () => api.get('/subjects/student/my-subjects'),
  enrollStudent: (subjectId) => api.post(`/subjects/${subjectId}/enroll`),
};

// Projects API
export const projectsAPI = {
  uploadProject: (formData) => api.post('/projects/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFacultyProjects: () => api.get('/projects/faculty'),
  getStudentProjects: () => api.get('/projects/student'),
  evaluateProject: (projectId, evaluationData) => 
    api.put(`/projects/evaluate/${projectId}`, evaluationData),
  getProjectsBySubject: (subjectId) => api.get(`/projects/subject/${subjectId}`),
};

// Admin API
export const adminAPI = {
  getPendingFaculty: () => api.get('/admin/pending-faculty'),
  approveFaculty: (userId) => api.put(`/admin/approve-faculty/${userId}`),
  rejectFaculty: (userId) => api.put(`/admin/reject-faculty/${userId}`),
};

export default api;
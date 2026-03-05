import axios from 'axios';

const api = axios.create({
    baseURL: '',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sageai_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Redirect to login on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('sageai_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Scans
export const createScan = (target) => api.post('/scan', { target });
export const getScan = (id) => api.get(`/scan/${id}`);
export const listScans = () => api.get('/scans');

// Reports
export const getReport = (scanId) => api.get(`/reports/${scanId}`);
export const downloadPdf = (scanId) =>
    api.get(`/reports/${scanId}/pdf`, { responseType: 'blob' });

// AI Explain
export const explainFinding = (type) => api.get(`/explain/${encodeURIComponent(type)}`);

// Organization
export const getOrgPlan = () => api.get('/org/plan');
export const getPlans = () => api.get('/org/plans');
export const getOrgUsers = () => api.get('/org/users');
export const updateUserRole = (userId, role) =>
    api.patch(`/org/users/${userId}/role?role=${role}`);
export const getOrgStats = () => api.get('/org/stats');

// API Keys
export const createApiKey = (name) => api.post(`/api-keys?name=${encodeURIComponent(name)}`);
export const listApiKeys = () => api.get('/api-keys');
export const revokeApiKey = (id) => api.delete(`/api-keys/${id}`);

// Webhooks
export const createWebhook = (url, event) =>
    api.post(`/webhooks?url=${encodeURIComponent(url)}&event=${event}`);
export const listWebhooks = () => api.get('/webhooks');
export const deleteWebhook = (id) => api.delete(`/webhooks/${id}`);

// Billing
export const createCheckout = (plan) => api.post(`/billing/checkout?plan=${plan}`);

// Schedules
export const createSchedule = (target, frequency) =>
    api.post(`/schedules?target=${encodeURIComponent(target)}&frequency=${frequency}`);
export const listSchedules = () => api.get('/schedules');
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`);

// MFA
export const setupMFA = () => api.post('/auth/mfa/setup');
export const verifyMFA = (code) => api.post(`/auth/mfa/verify?code=${code}`);
export const disableMFA = (code) => api.post(`/auth/mfa/disable?code=${code}`);

// Password Reset
export const forgotPassword = (email) => api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
export const resetPassword = (token, password) =>
    api.post(`/auth/reset-password?token=${token}&new_password=${encodeURIComponent(password)}`);

export default api;


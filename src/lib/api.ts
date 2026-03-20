import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('si_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('si_token');
      localStorage.removeItem('si_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const getCaptcha = () => api.get('/auth/captcha').then(r => r.data);
export const login = (data: object) => api.post('/auth/login', data).then(r => r.data);
export const register = (data: object) => api.post('/auth/register', data).then(r => r.data);
export const getMe = () => api.get('/auth/me').then(r => r.data);

export const getPackages = () => api.get('/packages').then(r => r.data);
export const investInPackage = (packageId: string) => api.post('/packages/invest', { packageId }).then(r => r.data);

export const getInvestments = () => api.get('/investments').then(r => r.data);
export const getActiveInvestments = () => api.get('/investments/active').then(r => r.data);
export const getInvestmentSummary = () => api.get('/investments/summary').then(r => r.data);

export const fundWallet = (amount: number) => api.post('/wallet/fund', { amount }).then(r => r.data);
export const verifyPayment = (reference: string) => api.get(`/wallet/verify/${reference}`).then(r => r.data);
export const withdraw = (data: object) => api.post('/wallet/withdraw', data).then(r => r.data);
export const getTransactions = () => api.get('/wallet/transactions').then(r => r.data);

export const getDashboard = () => api.get('/dashboard').then(r => r.data);
export const getPortfolio = () => api.get('/dashboard/portfolio').then(r => r.data);
export const getReferrals = () => api.get('/referrals').then(r => r.data);

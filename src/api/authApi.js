import api from './axios';

export const login            = (login, password) => api.post('/login', { login, password });
export const logout           = () => api.get('/logout');
export const demanderReset    = (login)           => api.post('/forgot-password', { login });
export const reinitialiserMdp = (data)            => api.post('/reset-password', data);

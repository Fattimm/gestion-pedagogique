import api from './axios';

export const login = (credentials) => api.post('/login', credentials);
export const logout = () => api.get('/logout');

import api from './axios';

export const getCours = () => api.get('/cours');
export const getCour = (id) => api.get(`/cours/${id}`);
export const createCours = (data) => api.post('/cours', data);
export const updateCours = (id, data) => api.patch(`/cours/${id}`, data);
export const deleteCours = (id) => api.delete(`/cours/${id}`);
export const getSessionsDuCours = (id) => api.get(`/cours/${id}/sessions`);
export const planifierSession = (data) => api.post('/sessions', data);
export const annulerSession = (id) => api.patch(`/sessions/${id}/annuler`);
export const getSessionsProfesseur = (id, params) => api.get(`/sessions/professeur/${id}`, { params });
export const getSessionsEtudiant = (id, params) => api.get(`/sessions/etudiant/${id}`, { params });
export const getHeuresMois = (id, params) => api.get(`/sessions/professeur/${id}/heures-mois`, { params });

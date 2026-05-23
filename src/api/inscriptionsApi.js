import api from './axios';

export const getInscriptions   = (params = {})  => api.get('/inscriptions', { params });
export const importerEtudiants = (formData)      => api.post('/inscriptions/importer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteInscription = (id)            => api.delete(`/inscriptions/${id}`);

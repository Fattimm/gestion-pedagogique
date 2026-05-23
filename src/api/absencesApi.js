import api from './axios';

export const getAbsencesEtudiant = (id, params) => api.get(`/absences/etudiant/${id}`, { params });
export const getAbsencesProfesseur = (id, params) => api.get(`/absences/professeur/${id}`, { params });
export const justifierAbsence = (id, data) => api.patch(`/absences/${id}/justifier`, data);
export const traiterAbsence = (id, data) => api.patch(`/absences/${id}/traiter`, data);
export const validerSession = (id, data) => api.post(`/sessions/${id}/valider`, data);
export const invaliderSession = (id) => api.delete(`/sessions/${id}/valider`);
export const signerPresence = (sessionId, data) => api.post(`/sessions/${sessionId}/signer`, data);
export const getEmargements = (sessionId) => api.get(`/sessions/${sessionId}/emargements`);

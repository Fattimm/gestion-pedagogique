import api from './axios';

// Années scolaires
export const getAnneeScolaires  = ()         => api.get('/annees-scolaires');
export const createAnneeScolaire = (data)    => api.post('/annees-scolaires', data);
export const updateAnneeScolaire = (id, data)=> api.patch(`/annees-scolaires/${id}`, data);
export const deleteAnneeScolaire = (id)      => api.delete(`/annees-scolaires/${id}`);

// Classes
export const getClasses    = ()          => api.get('/classes');
export const createClasse  = (data)      => api.post('/classes', data);
export const updateClasse  = (id, data)  => api.patch(`/classes/${id}`, data);
export const deleteClasse  = (id)        => api.delete(`/classes/${id}`);

// Salles
export const getSalles    = ()           => api.get('/salles');
export const createSalle  = (data)       => api.post('/salles', data);
export const updateSalle  = (id, data)   => api.patch(`/salles/${id}`, data);
export const deleteSalle  = (id)         => api.delete(`/salles/${id}`);

// Modules
export const getModules    = ()          => api.get('/modules');
export const createModule  = (data)      => api.post('/modules', data);
export const updateModule  = (id, data)  => api.patch(`/modules/${id}`, data);
export const deleteModule  = (id)        => api.delete(`/modules/${id}`);

// Semestres
export const getSemestres    = ()        => api.get('/semestres');
export const createSemestre  = (data)    => api.post('/semestres', data);
export const updateSemestre  = (id, data)=> api.patch(`/semestres/${id}`, data);
export const deleteSemestre  = (id)      => api.delete(`/semestres/${id}`);

// Classes dans une année scolaire
export const getClassesAnnee     = (anneeId)            => api.get(`/annees-scolaires/${anneeId}/classes`);
export const planifierClasseAnnee = (anneeId, classeId) => api.post(`/annees-scolaires/${anneeId}/classes`, { classe_id: classeId });
export const retirerClasseAnnee  = (anneeId, classeId)  => api.delete(`/annees-scolaires/${anneeId}/classes/${classeId}`);

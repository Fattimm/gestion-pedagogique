import { useEffect, useState } from 'react';
import { getCours, getSessionsDuCours } from '../../api/coursApi';
import { validerSession, invaliderSession, getEmargements } from '../../api/absencesApi';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';

const STATUT = {
  planifiee: { label: 'Planifiée', cls: 'bg-yellow-100 text-yellow-700' },
  effectuee: { label: 'Effectuée', cls: 'bg-green-100 text-green-700' },
  annulee:   { label: 'Annulée',   cls: 'bg-red-100 text-red-700' },
};

function EmargementsModal({ sessionId, onClose }) {
  const [emargements, setEmargements] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    getEmargements(sessionId)
      .then(res => setEmargements(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const STATUT_EM = {
    en_attente: { label: 'En attente', cls: 'bg-yellow-100 text-yellow-700' },
    valide:     { label: 'Validé',     cls: 'bg-green-100 text-green-700' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Émargements de la session</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        {loading ? (
          <p className="text-gray-500 text-sm">Chargement...</p>
        ) : emargements.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun émargement enregistré pour cette session.</p>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Étudiant</th>
                  <th className="px-4 py-2 text-left">Signé à</th>
                  <th className="px-4 py-2 text-left">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emargements.map(e => {
                  const st = STATUT_EM[e.statut] ?? { label: e.statut, cls: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{e.etudiant?.prenom} {e.etudiant?.nom}</td>
                      <td className="px-4 py-2 text-gray-500">
                        {e.signe_a ? new Date(e.signe_a).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-xs text-gray-400">
          {emargements.length} présence(s) enregistrée(s)
        </div>
        <div className="mt-3 text-right">
          <button onClick={onClose}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sessions() {
  const { user } = useAuthStore();
  const [onglet, setOnglet]               = useState('valider');
  const [cours, setCours]                 = useState([]);
  const [sessions, setSessions]           = useState([]);
  const [aValider, setAValider]           = useState([]);
  const [selectedCours, setSelectedCours] = useState('');
  const [statutFilter, setStatutFilter]   = useState('');
  const [loading, setLoading]             = useState(false);
  const [message, setMessage]             = useState('');
  const [emargementsId, setEmargementsId] = useState(null);

  useEffect(() => {
    getCours().then(res => setCours(res.data.data ?? []));
    chargerAValider();
  }, []);

  useEffect(() => {
    if (!selectedCours) { setSessions([]); return; }
    chargerSessions();
  }, [selectedCours]);

  const chargerAValider = () => {
    setLoading(true);
    api.get('/sessions', { params: { a_valider: 1 } })
      .then(res => setAValider(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  const chargerSessions = () => {
    setLoading(true);
    getSessionsDuCours(selectedCours)
      .then(res => setSessions(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  const notify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleValider = async (sessionId) => {
    await validerSession(sessionId, { attache_id: user.id });
    notify('Session validée avec succès.');
    chargerAValider();
    if (selectedCours) chargerSessions();
  };

  const handleInvalider = async (sessionId) => {
    await invaliderSession(sessionId);
    notify('Validation annulée.');
    chargerAValider();
    if (selectedCours) chargerSessions();
  };

  const displayed = sessions.filter(s => !statutFilter || s.statut === statutFilter);

  return (
    <div>
      <PageHeader title="Sessions" />

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button onClick={() => setOnglet('valider')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            onglet === 'valider' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          À valider
          {aValider.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{aValider.length}</span>
          )}
        </button>
        <button onClick={() => setOnglet('cours')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            onglet === 'cours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}>
          Par cours
        </button>
      </div>

      {message && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">{message}</div>
      )}

      {/* ── Onglet À valider ── */}
      {onglet === 'valider' && (
        <>
          {loading && <p className="text-gray-500">Chargement...</p>}
          {!loading && aValider.length === 0 && (
            <p className="text-gray-400">Aucune session en attente de validation.</p>
          )}
          {!loading && aValider.length > 0 && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Module</th>
                    <th className="px-6 py-3 text-left">Professeur</th>
                    <th className="px-6 py-3 text-left">Horaire</th>
                    <th className="px-6 py-3 text-left">Durée</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {aValider.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4 text-gray-700">{s.cours?.module?.libelle}</td>
                      <td className="px-6 py-4 text-gray-500">{s.cours?.professeur?.prenom} {s.cours?.professeur?.nom}</td>
                      <td className="px-6 py-4 text-gray-500">{s.heure_debut?.slice(0,5)} — {s.heure_fin?.slice(0,5)}</td>
                      <td className="px-6 py-4 text-gray-500">{s.nbre_heure}h</td>
                      <td className="px-6 py-4 space-x-2">
                        <button onClick={() => setEmargementsId(s.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-lg">
                          Émargements
                        </button>
                        <button onClick={() => handleValider(s.id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg">
                          Valider
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Onglet Par cours ── */}
      {onglet === 'cours' && (
        <>
          <div className="flex gap-4 mb-6">
            <select value={selectedCours} onChange={e => setSelectedCours(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">-- Sélectionner un cours --</option>
              {cours.map(c => (
                <option key={c.id} value={c.id}>
                  {c.module?.libelle} — {c.professeur?.prenom} {c.professeur?.nom}
                </option>
              ))}
            </select>
            <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Tous les statuts</option>
              <option value="planifiee">Planifiée</option>
              <option value="effectuee">Effectuée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>

          {!selectedCours && <p className="text-gray-400">Sélectionnez un cours pour voir ses sessions.</p>}
          {loading && <p className="text-gray-500">Chargement...</p>}

          {!loading && selectedCours && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Horaire</th>
                    <th className="px-6 py-3 text-left">Durée</th>
                    <th className="px-6 py-3 text-left">Statut</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayed.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucune session.</td></tr>
                  ) : displayed.map(s => {
                    const st = STATUT[s.statut] ?? { label: s.statut, cls: 'bg-gray-100 text-gray-600' };
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-gray-500">{s.heure_debut?.slice(0,5)} — {s.heure_fin?.slice(0,5)}</td>
                        <td className="px-6 py-4 text-gray-500">{s.nbre_heure}h</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          {(s.statut === 'planifiee' || s.statut === 'effectuee') && (
                            <button onClick={() => setEmargementsId(s.id)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-lg">
                              Émargements
                            </button>
                          )}
                          {s.statut === 'planifiee' && (
                            <button onClick={() => handleValider(s.id)}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg">
                              Valider
                            </button>
                          )}
                          {s.statut === 'effectuee' && (
                            <button onClick={() => handleInvalider(s.id)}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg">
                              Invalider
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {emargementsId && (
        <EmargementsModal sessionId={emargementsId} onClose={() => setEmargementsId(null)} />
      )}
    </div>
  );
}

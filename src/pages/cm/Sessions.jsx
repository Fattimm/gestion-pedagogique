import { useEffect, useState } from 'react';
import { getCours, getSessionsDuCours } from '../../api/coursApi';
import { validerSession, invaliderSession, getEmargements } from '../../api/absencesApi';
import { useAuthStore } from '../../store/authStore';

export default function Sessions() {
  const [cours, setCours] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedCours, setSelectedCours] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    getCours().then((res) => setCours(res.data.data));
  }, []);

  useEffect(() => {
    if (!selectedCours) return;
    chargerSessions();
  }, [selectedCours]);

  const chargerSessions = () => {
    setLoading(true);
    getSessionsDuCours(selectedCours)
      .then((res) => setSessions(res.data.data))
      .finally(() => setLoading(false));
  };

  const handleValider = async (sessionId) => {
    await validerSession(sessionId, { attache_id: user.id });
    setMessage('Session validée.');
    chargerSessions();
  };

  const handleInvalider = async (sessionId) => {
    await invaliderSession(sessionId);
    setMessage('Validation annulée.');
    chargerSessions();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sessions</h1>
        <select
          value={selectedCours}
          onChange={(e) => setSelectedCours(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Sélectionner un cours</option>
          {cours.map((c) => (
            <option key={c.id} value={c.id}>
              {c.module?.libelle} — {c.professeur?.prenom} {c.professeur?.nom}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
          {message}
        </div>
      )}

      {!selectedCours && <p className="text-gray-400">Sélectionnez un cours pour voir ses sessions.</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && selectedCours && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Horaire</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                    Aucune session.
                  </td>
                </tr>
              ) : sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {new Date(s.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {s.heure_debut.slice(0, 5)} — {s.heure_fin.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      s.statut === 'effectuee' ? 'bg-green-100 text-green-700' :
                      s.statut === 'planifiee' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {s.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {s.statut === 'planifiee' && (
                      <button
                        onClick={() => handleValider(s.id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg"
                      >
                        Valider
                      </button>
                    )}
                    {s.statut === 'effectuee' && (
                      <button
                        onClick={() => handleInvalider(s.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg"
                      >
                        Invalider
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

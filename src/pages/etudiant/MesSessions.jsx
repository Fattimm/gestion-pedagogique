import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { signerPresence } from '../../api/absencesApi';
import api from '../../api/axios';

export default function MesSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSessions();
  }, [periode]);

  const fetchSessions = () => {
    setLoading(true);
    const params = periode ? { periode } : {};
    api.get(`/sessions/etudiant/${user.id}`, { params })
      .then((res) => setSessions(res.data.data))
      .finally(() => setLoading(false));
  };

  const handleSigner = async (sessionId) => {
    try {
      await signerPresence(sessionId, { etudiant_id: user.id });
      setMessage('Présence signée avec succès.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Impossible de signer.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mes sessions</h1>
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Toutes</option>
          <option value="jour">Aujourd'hui</option>
          <option value="semaine">Cette semaine</option>
        </select>
      </div>

      {message && (
        <div className="mb-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Module</th>
                <th className="px-6 py-3 text-left">Horaire</th>
                <th className="px-6 py-3 text-left">Salle</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    Aucune session.
                  </td>
                </tr>
              ) : sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {new Date(s.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{s.cours?.module?.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {s.heure_debut.slice(0, 5)} — {s.heure_fin.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{s.salle?.nom || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      s.statut === 'effectuee' ? 'bg-green-100 text-green-700' :
                      s.statut === 'planifiee' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {s.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {s.statut === 'planifiee' && (
                      <button
                        onClick={() => handleSigner(s.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg"
                      >
                        Signer
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

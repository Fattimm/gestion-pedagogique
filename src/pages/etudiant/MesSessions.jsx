import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { signerPresence } from '../../api/absencesApi';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';

const STATUT = {
  planifiee: { label: 'Planifiée',  cls: 'bg-yellow-100 text-yellow-700' },
  effectuee: { label: 'Effectuée',  cls: 'bg-green-100 text-green-700' },
  annulee:   { label: 'Annulée',    cls: 'bg-red-100 text-red-700' },
};

export default function MesSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [periode, setPeriode]   = useState('');
  const [message, setMessage]   = useState({ text: '', type: 'blue' });
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSessions();
  }, [periode]);

  const fetchSessions = () => {
    setLoading(true);
    const params = periode ? { periode } : {};
    api.get(`/sessions/etudiant/${user.id}`, { params })
      .then(res => setSessions(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  const notify = (text, type = 'green') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'green' }), 3000);
  };

  const handleSigner = async (sessionId) => {
    try {
      await signerPresence(sessionId, { etudiant_id: user.id });
      notify('Présence signée avec succès.');
    } catch (err) {
      notify(err.response?.data?.message || 'Impossible de signer.', 'red');
    }
  };

  const msgCls = message.type === 'red'
    ? 'bg-red-100 text-red-700'
    : 'bg-green-100 text-green-700';

  return (
    <div>
      <PageHeader title="Mes sessions">
        <select value={periode} onChange={e => setPeriode(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm">
          <option value="">Toutes</option>
          <option value="jour">Aujourd'hui</option>
          <option value="semaine">Cette semaine</option>
        </select>
      </PageHeader>

      {message.text && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm ${msgCls}`}>{message.text}</div>
      )}

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-400">Aucune session trouvée.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Module</th>
                <th className="px-6 py-3 text-left">Professeur</th>
                <th className="px-6 py-3 text-left">Horaire</th>
                <th className="px-6 py-3 text-left">Salle</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map(s => {
                const st = STATUT[s.statut] ?? { label: s.statut, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-gray-700">{s.cours?.module?.libelle}</td>
                    <td className="px-6 py-4 text-gray-500">{s.cours?.professeur?.prenom} {s.cours?.professeur?.nom}</td>
                    <td className="px-6 py-4 text-gray-500">{s.heure_debut?.slice(0, 5)} — {s.heure_fin?.slice(0, 5)}</td>
                    <td className="px-6 py-4 text-gray-500">{s.salle?.nom || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

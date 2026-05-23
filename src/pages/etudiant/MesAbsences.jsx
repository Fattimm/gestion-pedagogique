import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getAbsencesEtudiant, justifierAbsence } from '../../api/absencesApi';
import PageHeader from '../../components/PageHeader';

const STATUT_JUST = {
  non_justifiee: { label: 'Non justifiée', cls: 'bg-gray-100 text-gray-600' },
  en_attente:    { label: 'En attente',    cls: 'bg-yellow-100 text-yellow-700' },
  acceptee:      { label: 'Acceptée',      cls: 'bg-green-100 text-green-700' },
  refusee:       { label: 'Refusée',       cls: 'bg-red-100 text-red-700' },
};

function JustificationModal({ onSubmit, onCancel }) {
  const [motif, setMotif] = useState('');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="font-bold text-gray-800 mb-4">Justifier l'absence</h2>
        <textarea
          value={motif}
          onChange={e => setMotif(e.target.value)}
          placeholder="Décrivez le motif de votre absence..."
          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          rows={4}
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
            Annuler
          </button>
          <button onClick={() => motif.trim() && onSubmit(motif)}
            disabled={!motif.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MesAbsences() {
  const [absences, setAbsences]           = useState([]);
  const [stats, setStats]                 = useState(null);
  const [loading, setLoading]             = useState(true);
  const [message, setMessage]             = useState('');
  const [absenceSelectee, setAbsenceSelectee] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = () => {
    setLoading(true);
    getAbsencesEtudiant(user.id)
      .then(res => {
        setAbsences(res.data.data ?? []);
        setStats({
          total:      res.data.total_heures      ?? 0,
          justifiees: res.data.heures_justifiees ?? 0,
          comptees:   res.data.heures_comptees   ?? 0,
        });
      })
      .finally(() => setLoading(false));
  };

  const notify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleJustifier = async (motif) => {
    try {
      await justifierAbsence(absenceSelectee, {
        motif,
        date: new Date().toISOString().split('T')[0],
      });
      notify('Justification soumise avec succès.');
      setAbsenceSelectee(null);
      fetchAbsences();
    } catch (err) {
      notify(err.response?.data?.message || 'Erreur lors de la soumission.');
      setAbsenceSelectee(null);
    }
  };

  return (
    <div>
      <PageHeader title="Mes absences" />

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.total}h</p>
            <p className="text-xs text-gray-500 mt-1">Total absences</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.justifiees}h</p>
            <p className="text-xs text-gray-500 mt-1">Justifiées (acceptées)</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.comptees}h</p>
            <p className="text-xs text-gray-500 mt-1">Comptées</p>
          </div>
        </div>
      )}

      {message && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">{message}</div>
      )}

      {absenceSelectee && (
        <JustificationModal
          onSubmit={handleJustifier}
          onCancel={() => setAbsenceSelectee(null)}
        />
      )}

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : absences.length === 0 ? (
        <p className="text-gray-400">Aucune absence enregistrée.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Module</th>
                <th className="px-6 py-3 text-left">Heures</th>
                <th className="px-6 py-3 text-left">Motif soumis</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {absences.map(a => {
                const sj = STATUT_JUST[a.statut_justification] ?? { label: a.statut_justification, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-gray-700">{a.session?.cours?.module?.libelle}</td>
                    <td className="px-6 py-4 text-gray-500">{a.nbre_heure}h</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{a.justification_motif || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sj.cls}`}>{sj.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      {a.statut_justification === 'non_justifiee' && (
                        <button
                          onClick={() => setAbsenceSelectee(a.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg"
                        >
                          Justifier
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

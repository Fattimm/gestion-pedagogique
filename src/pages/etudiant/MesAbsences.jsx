import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { getAbsencesEtudiant, justifierAbsence } from '../../api/absencesApi';

export default function MesAbsences() {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [motif, setMotif] = useState('');
  const [absenceSelectee, setAbsenceSelectee] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = () => {
    setLoading(true);
    getAbsencesEtudiant(user.id)
      .then((res) => setAbsences(res.data.data))
      .finally(() => setLoading(false));
  };

  const handleJustifier = async (absenceId) => {
    try {
      await justifierAbsence(absenceId, { motif, date: new Date().toISOString().split('T')[0] });
      setMessage('Justification soumise.');
      setAbsenceSelectee(null);
      setMotif('');
      fetchAbsences();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes absences</h1>

      {message && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
          {message}
        </div>
      )}

      {absenceSelectee && (
        <div className="mb-6 bg-white rounded-xl shadow p-6">
          <h2 className="font-bold text-gray-800 mb-3">Justifier l'absence</h2>
          <textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Décrivez le motif..."
            className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleJustifier(absenceSelectee)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
            >
              Envoyer
            </button>
            <button
              onClick={() => setAbsenceSelectee(null)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg"
            >
              Annuler
            </button>
          </div>
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
                <th className="px-6 py-3 text-left">Heures</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {absences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    Aucune absence.
                  </td>
                </tr>
              ) : absences.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {new Date(a.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {a.session?.cours?.module?.libelle}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{a.nbre_heure}h</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      a.statut_justification === 'acceptee' ? 'bg-green-100 text-green-700' :
                      a.statut_justification === 'refusee' ? 'bg-red-100 text-red-700' :
                      a.statut_justification === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {a.statut_justification}
                    </span>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

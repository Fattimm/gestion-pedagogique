import { useEffect, useState } from 'react';
import { getUsers } from '../../api/usersApi';
import { getAbsencesEtudiant, traiterAbsence } from '../../api/absencesApi';
import { useAuthStore } from '../../store/authStore';

export default function Absences() {
  const [etudiants, setEtudiants] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    getUsers('APPRENANT').then((res) => setEtudiants(res.data.users));
  }, []);

  useEffect(() => {
    if (!selectedEtudiant) return;
    chargerAbsences();
  }, [selectedEtudiant]);

  const chargerAbsences = () => {
    setLoading(true);
    getAbsencesEtudiant(selectedEtudiant)
      .then((res) => setAbsences(res.data.data))
      .finally(() => setLoading(false));
  };

  const handleTraiter = async (absenceId, statut) => {
    await traiterAbsence(absenceId, { statut, attache_id: user.id });
    setMessage(`Justification ${statut}.`);
    chargerAbsences();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Absences</h1>
        <select
          value={selectedEtudiant}
          onChange={(e) => setSelectedEtudiant(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Sélectionner un étudiant</option>
          {etudiants.map((e) => (
            <option key={e.id} value={e.id}>
              {e.prenom} {e.nom}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
          {message}
        </div>
      )}

      {!selectedEtudiant && <p className="text-gray-400">Sélectionnez un étudiant.</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && selectedEtudiant && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Heures</th>
                <th className="px-6 py-3 text-left">Motif</th>
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
                  <td className="px-6 py-4 text-gray-500">{a.nbre_heure}h</td>
                  <td className="px-6 py-4 text-gray-500">{a.justification_motif || '—'}</td>
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
                  <td className="px-6 py-4 space-x-2">
                    {a.statut_justification === 'en_attente' && (
                      <>
                        <button
                          onClick={() => handleTraiter(a.id, 'acceptee')}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleTraiter(a.id, 'refusee')}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg"
                        >
                          Refuser
                        </button>
                      </>
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

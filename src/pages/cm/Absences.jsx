import { useEffect, useState } from 'react';
import { getUsers } from '../../api/usersApi';
import { getAbsencesEtudiant, getAbsencesProfesseur, traiterAbsence } from '../../api/absencesApi';
import { useAuthStore } from '../../store/authStore';
import PageHeader from '../../components/PageHeader';

const STATUT_JUST = {
  non_justifiee: { label: 'Non justifiée', cls: 'bg-gray-100 text-gray-600' },
  en_attente:    { label: 'En attente',    cls: 'bg-yellow-100 text-yellow-700' },
  acceptee:      { label: 'Acceptée',      cls: 'bg-green-100 text-green-700' },
  refusee:       { label: 'Refusée',       cls: 'bg-red-100 text-red-700' },
};

export default function Absences() {
  const { user } = useAuthStore();
  const [onglet, setOnglet] = useState('etudiant'); // 'etudiant' | 'professeur'

  // Onglet étudiant
  const [etudiants, setEtudiants]               = useState([]);
  const [absences, setAbsences]                 = useState([]);
  const [selectedEtudiant, setSelectedEtudiant] = useState('');
  const [statutFilter, setStatutFilter]         = useState('');
  const [loadingAbs, setLoadingAbs]             = useState(false);

  // Onglet professeur
  const [professeurs, setProfesseurs]           = useState([]);
  const [selectedProf, setSelectedProf]         = useState('');
  const [absencesProf, setAbsencesProf]         = useState([]);
  const [loadingProf, setLoadingProf]           = useState(false);

  const [message, setMessage] = useState('');

  useEffect(() => {
    getUsers('APPRENANT').then(res => setEtudiants(res.data.users ?? []));
    getUsers('COACH').then(res => setProfesseurs(res.data.users ?? []));
  }, []);

  useEffect(() => {
    if (!selectedEtudiant) { setAbsences([]); return; }
    chargerAbsences();
  }, [selectedEtudiant]);

  useEffect(() => {
    if (!selectedProf) { setAbsencesProf([]); return; }
    chargerAbsencesProf();
  }, [selectedProf]);

  const chargerAbsences = () => {
    setLoadingAbs(true);
    getAbsencesEtudiant(selectedEtudiant)
      .then(res => setAbsences(res.data.data ?? []))
      .finally(() => setLoadingAbs(false));
  };

  const chargerAbsencesProf = () => {
    setLoadingProf(true);
    getAbsencesProfesseur(selectedProf)
      .then(res => setAbsencesProf(res.data.data ?? []))
      .finally(() => setLoadingProf(false));
  };

  const notify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTraiter = async (absenceId, statut) => {
    await traiterAbsence(absenceId, { statut, attache_id: user.id });
    notify(statut === 'acceptee' ? 'Justification acceptée.' : 'Justification refusée.');
    chargerAbsences();
  };

  const displayed = absences.filter(a => !statutFilter || a.statut_justification === statutFilter);

  return (
    <div>
      <PageHeader title="Absences" />

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[['etudiant', 'Par étudiant'], ['professeur', 'Par professeur']].map(([key, label]) => (
          <button key={key} onClick={() => setOnglet(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              onglet === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {message && (
        <div className="mb-4 bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">{message}</div>
      )}

      {/* ── Onglet Par étudiant ── */}
      {onglet === 'etudiant' && (
        <>
          <div className="flex gap-4 mb-6">
            <select value={selectedEtudiant} onChange={e => setSelectedEtudiant(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">-- Sélectionner un étudiant --</option>
              {etudiants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
            </select>
            <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Tous les statuts</option>
              <option value="non_justifiee">Non justifiée</option>
              <option value="en_attente">En attente</option>
              <option value="acceptee">Acceptée</option>
              <option value="refusee">Refusée</option>
            </select>
          </div>

          {!selectedEtudiant && <p className="text-gray-400">Sélectionnez un étudiant pour voir ses absences.</p>}
          {loadingAbs && <p className="text-gray-500">Chargement...</p>}

          {!loadingAbs && selectedEtudiant && (
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
                  {displayed.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucune absence.</td></tr>
                  ) : displayed.map(a => {
                    const sj = STATUT_JUST[a.statut_justification] ?? { label: a.statut_justification, cls: 'bg-gray-100 text-gray-600' };
                    return (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-gray-500">{a.nbre_heure}h</td>
                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{a.justification_motif || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sj.cls}`}>{sj.label}</span>
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          {a.statut_justification === 'en_attente' && (
                            <>
                              <button onClick={() => handleTraiter(a.id, 'acceptee')}
                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg">
                                Accepter
                              </button>
                              <button onClick={() => handleTraiter(a.id, 'refusee')}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg">
                                Refuser
                              </button>
                            </>
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

      {/* ── Onglet Par professeur ── */}
      {onglet === 'professeur' && (
        <>
          <div className="mb-6">
            <select value={selectedProf} onChange={e => setSelectedProf(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">-- Sélectionner un professeur --</option>
              {professeurs.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
            </select>
          </div>

          {!selectedProf && <p className="text-gray-400">Sélectionnez un professeur pour voir les absences de ses cours.</p>}
          {loadingProf && <p className="text-gray-500">Chargement...</p>}

          {!loadingProf && selectedProf && (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Module</th>
                    <th className="px-6 py-3 text-left">Étudiant</th>
                    <th className="px-6 py-3 text-left">Heures</th>
                    <th className="px-6 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {absencesProf.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucune absence trouvée.</td></tr>
                  ) : absencesProf.map(a => {
                    const sj = STATUT_JUST[a.statut_justification] ?? { label: a.statut_justification, cls: 'bg-gray-100 text-gray-600' };
                    return (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                        <td className="px-6 py-4 text-gray-700">{a.session?.cours?.module?.libelle}</td>
                        <td className="px-6 py-4 text-gray-500">{a.etudiant?.prenom} {a.etudiant?.nom}</td>
                        <td className="px-6 py-4 text-gray-500">{a.nbre_heure}h</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sj.cls}`}>{sj.label}</span>
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
    </div>
  );
}

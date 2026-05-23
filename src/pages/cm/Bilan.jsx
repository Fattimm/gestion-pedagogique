import { useEffect, useState } from 'react';
import { getUsers } from '../../api/usersApi';
import { getHeuresMois } from '../../api/coursApi';
import api from '../../api/axios';

export default function Bilan() {
  const [professeurs, setProfesseurs] = useState([]);
  const [selectedProf, setSelectedProf] = useState('');
  const [bilan, setBilan] = useState([]);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUsers('COACH').then((res) => setProfesseurs(res.data.users));
  }, []);

  useEffect(() => {
    if (!selectedProf) return;
    chargerBilan();
  }, [selectedProf, mois, annee]);

  const chargerBilan = () => {
    setLoading(true);
    api.get(`/sessions/professeur/${selectedProf}/bilan`, { params: { mois, annee } })
      .then((res) => setBilan(res.data.data))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bilan professeurs</h1>
        <select
          value={selectedProf}
          onChange={(e) => setSelectedProf(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Sélectionner un professeur</option>
          {professeurs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.prenom} {p.nom}
            </option>
          ))}
        </select>
        <select
          value={mois}
          onChange={(e) => setMois(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('fr-FR', { month: 'long' })}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {!selectedProf && <p className="text-gray-400">Sélectionnez un professeur.</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && selectedProf && (
        <div className="space-y-4">
          {bilan.length === 0 ? (
            <p className="text-gray-400">Aucun cours ce mois-ci.</p>
          ) : bilan.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800">{item.cours?.module?.libelle}</h2>
                <div className="flex gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    Quota : {item.quota_global}h
                  </span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Effectuées : {item.heures_deroulees}h
                  </span>
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                    Restantes : {item.heures_restantes}h
                  </span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Horaire</th>
                    <th className="px-4 py-2 text-left">Durée</th>
                    <th className="px-4 py-2 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {item.sessions_du_mois?.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-2">{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-2 text-gray-500">{s.heure_debut.slice(0,5)} — {s.heure_fin.slice(0,5)}</td>
                      <td className="px-4 py-2 text-gray-500">{s.nbre_heure}h</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          s.statut === 'effectuee' ? 'bg-green-100 text-green-700' :
                          s.statut === 'planifiee' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {s.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

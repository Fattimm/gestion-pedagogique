import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

export default function MesHeures() {
  const [data, setData] = useState(null);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchHeures();
  }, [mois, annee]);

  const fetchHeures = () => {
    setLoading(true);
    api.get(`/sessions/professeur/${user.id}/heures-mois`, { params: { mois, annee } })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mes heures</h1>
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

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && data && (
        <>
          <div className="bg-blue-600 text-white rounded-xl p-6 mb-6 inline-block">
            <p className="text-sm opacity-80">Total heures effectuées</p>
            <p className="text-4xl font-bold mt-1">{data.total_heures}h</p>
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Module</th>
                  <th className="px-6 py-3 text-left">Horaire</th>
                  <th className="px-6 py-3 text-left">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.data?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                      Aucune session effectuée ce mois-ci.
                    </td>
                  </tr>
                ) : data.data?.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {new Date(s.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{s.cours?.module?.libelle}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {s.heure_debut.slice(0, 5)} — {s.heure_fin.slice(0, 5)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{s.nbre_heure}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

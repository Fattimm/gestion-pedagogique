import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';

export default function MesCours() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchCours();
  }, [periode]);

  const fetchCours = () => {
    setLoading(true);
    const params = periode ? { periode } : {};
    api.get(`/cours/etudiant/${user.id}`, { params })
      .then((res) => setCours(res.data.data))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mes cours</h1>
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Tous</option>
          <option value="jour">Aujourd'hui</option>
          <option value="semaine">Cette semaine</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Module</th>
                <th className="px-6 py-3 text-left">Professeur</th>
                <th className="px-6 py-3 text-left">Semestre</th>
                <th className="px-6 py-3 text-left">Quota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cours.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                    Aucun cours.
                  </td>
                </tr>
              ) : cours.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{c.module?.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {c.professeur?.prenom} {c.professeur?.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{c.semestre?.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">{c.quota_horaire_global}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';

export default function MesCours() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    api.get(`/cours/etudiant/${user.id}`)
      .then(res => setCours(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div>
      <PageHeader title="Mes cours" />

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : cours.length === 0 ? (
        <p className="text-gray-400">Aucun cours trouvé.</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Module</th>
                <th className="px-6 py-3 text-left">Professeur</th>
                <th className="px-6 py-3 text-left">Semestre</th>
                <th className="px-6 py-3 text-left">Quota horaire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cours.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{c.module?.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">{c.professeur?.prenom} {c.professeur?.nom}</td>
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

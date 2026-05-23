import { useEffect, useState } from 'react';
import { getCours } from '../../api/coursApi';

export default function Cours() {
  const [cours, setCours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCours();
  }, []);

  const fetchCours = async () => {
    setLoading(true);
    try {
      const res = await getCours();
      setCours(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cours</h1>
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
                <th className="px-6 py-3 text-left">Quota horaire</th>
                <th className="px-6 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cours.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{c.module?.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {c.professeur?.prenom} {c.professeur?.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{c.quota_horaire_global}h</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      c.statut === 'en_cours' ? 'bg-green-100 text-green-700' :
                      c.statut === 'planifie' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.statut}
                    </span>
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

import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Inscriptions() {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/inscriptions')
      .then((res) => setInscriptions(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inscriptions</h1>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Étudiant</th>
                <th className="px-6 py-3 text-left">Classe</th>
                <th className="px-6 py-3 text-left">Année scolaire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inscriptions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-400">
                    Aucune inscription.
                  </td>
                </tr>
              ) : inscriptions.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    {i.etudiant?.prenom} {i.etudiant?.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{i.classe?.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">{i.annee_scolaire?.libelle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

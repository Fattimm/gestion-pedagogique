import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/axios';
import PageHeader from '../../components/PageHeader';

const STATUT = {
  planifie: { label: 'Planifié', cls: 'bg-yellow-100 text-yellow-700' },
  en_cours: { label: 'En cours', cls: 'bg-green-100 text-green-700' },
  termine:  { label: 'Terminé',  cls: 'bg-gray-100 text-gray-600' },
};

export default function MesCours() {
  const [cours, setCours]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState('');
  const { user } = useAuthStore();

  useEffect(() => { fetchCours(); }, [periode]);

  const fetchCours = () => {
    setLoading(true);
    const params = periode ? { periode } : {};
    api.get(`/cours/professeur/${user.id}`, { params })
      .then(res => setCours(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <PageHeader title="Mes cours">
        <select value={periode} onChange={e => setPeriode(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm">
          <option value="">Tous</option>
          <option value="jour">Aujourd'hui</option>
          <option value="semaine">Cette semaine</option>
        </select>
      </PageHeader>

      {loading ? <p className="text-gray-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Module</th>
                <th className="px-6 py-3 text-left">Semestre</th>
                <th className="px-6 py-3 text-left">Classes</th>
                <th className="px-6 py-3 text-left">Quota</th>
                <th className="px-6 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cours.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucun cours.</td></tr>
              ) : cours.map(c => {
                const s = STATUT[c.statut] ?? { label: c.statut, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{c.module?.libelle}</td>
                    <td className="px-6 py-4 text-gray-500">{c.semestre?.libelle}</td>
                    <td className="px-6 py-4 text-gray-500">{c.classes?.map(cl => cl.libelle).join(', ') || '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{c.quota_horaire_global}h</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
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

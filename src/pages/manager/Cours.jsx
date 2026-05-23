import { useEffect, useState } from 'react';
import { getCours, createCours, deleteCours, getEtudiantsDuCours } from '../../api/coursApi';
import { getUsers } from '../../api/usersApi';
import { getModules, getSemestres, getClasses } from '../../api/referentielApi';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';

const STATUT_LABELS = {
  planifie: { label: 'Planifié', cls: 'bg-yellow-100 text-yellow-700' },
  en_cours: { label: 'En cours', cls: 'bg-green-100 text-green-700' },
  termine:  { label: 'Terminé',  cls: 'bg-gray-100 text-gray-600' },
};

const emptyForm = {
  semestre_id: '', module_id: '', professeur_id: '',
  quota_horaire_global: '', classes: [], statut: 'planifie',
};

function EtudiantsModal({ coursId, onClose }) {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getEtudiantsDuCours(coursId)
      .then(res => setEtudiants(res.data.data ?? []))
      .finally(() => setLoading(false));
  }, [coursId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Étudiants inscrits</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        {loading ? (
          <p className="text-gray-500 text-sm">Chargement...</p>
        ) : etudiants.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun étudiant inscrit dans ce cours.</p>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Étudiant</th>
                  <th className="px-4 py-2 text-left">Login</th>
                  <th className="px-4 py-2 text-left">Classe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {etudiants.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{i.etudiant?.prenom} {i.etudiant?.nom}</td>
                    <td className="px-4 py-2 text-gray-500">{i.etudiant?.login}</td>
                    <td className="px-4 py-2 text-gray-500">{i.classe?.libelle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-right">
          <button onClick={onClose}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Cours() {
  const [cours, setCours]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statutFilter, setStatutFilter] = useState('');

  const [showModal, setShowModal]         = useState(false);
  const [confirmId, setConfirmId]         = useState(null);
  const [etudiantsCoursId, setEtudiantsCoursId] = useState(null);
  const [form, setForm]                   = useState(emptyForm);
  const [saving, setSaving]               = useState(false);
  const [formError, setFormError]         = useState('');

  const [modules, setModules]     = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [classes, setClasses]     = useState([]);
  const [profs, setProfs]         = useState([]);

  useEffect(() => { fetchCours(); }, [statutFilter]);

  useEffect(() => {
    if (showModal) loadReferentiels();
  }, [showModal]);

  const fetchCours = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statutFilter) params.statut = statutFilter;
      const res = await getCours(params);
      setCours(res.data.data ?? []);
    } finally { setLoading(false); }
  };

  const loadReferentiels = async () => {
    try {
      const [modRes, semRes, clsRes, profRes] = await Promise.all([
        getModules(), getSemestres(), getClasses(), getUsers('COACH'),
      ]);
      setModules(modRes.data.data ?? modRes.data ?? []);
      setSemestres(semRes.data.data ?? semRes.data ?? []);
      setClasses(clsRes.data.data ?? clsRes.data ?? []);
      setProfs(profRes.data.users ?? []);
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      await createCours({
        ...form,
        semestre_id:          Number(form.semestre_id),
        module_id:            Number(form.module_id),
        professeur_id:        Number(form.professeur_id),
        quota_horaire_global: Number(form.quota_horaire_global),
        classes:              form.classes.map(Number),
      });
      setShowModal(false);
      setForm(emptyForm);
      fetchCours();
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Erreur lors de la création');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await deleteCours(confirmId);
    setConfirmId(null);
    fetchCours();
  };

  const toggleClasse = (id) => {
    setForm(f => ({
      ...f,
      classes: f.classes.includes(id) ? f.classes.filter(c => c !== id) : [...f.classes, id],
    }));
  };

  const displayed = cours.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.module?.libelle?.toLowerCase().includes(q) ||
      c.professeur?.nom?.toLowerCase().includes(q) ||
      c.professeur?.prenom?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader title="Cours"
        action={{ label: '+ Nouveau cours', onClick: () => { setShowModal(true); setFormError(''); } }}>
        <input type="text" placeholder="Rechercher module ou professeur..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm flex-1" />
        <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm">
          <option value="">Tous les statuts</option>
          <option value="planifie">Planifié</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
        </select>
      </PageHeader>

      {loading ? <p className="text-gray-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Module</th>
                <th className="px-6 py-3 text-left">Professeur</th>
                <th className="px-6 py-3 text-left">Semestre</th>
                <th className="px-6 py-3 text-left">Quota</th>
                <th className="px-6 py-3 text-left">Classes</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Aucun cours trouvé</td></tr>
              )}
              {displayed.map(c => {
                const s = STATUT_LABELS[c.statut] ?? { label: c.statut, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{c.module?.libelle}</td>
                    <td className="px-6 py-4 text-gray-500">{c.professeur?.prenom} {c.professeur?.nom}</td>
                    <td className="px-6 py-4 text-gray-500">{c.semestre?.libelle}</td>
                    <td className="px-6 py-4 text-gray-500">{c.quota_horaire_global}h</td>
                    <td className="px-6 py-4 text-gray-500">{c.classes?.map(cl => cl.libelle).join(', ') || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.label}</span>
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button onClick={() => setEtudiantsCoursId(c.id)}
                        className="text-blue-600 hover:underline text-sm">Étudiants</button>
                      <button onClick={() => setConfirmId(c.id)}
                        className="text-red-500 hover:underline text-sm">Supprimer</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmId && (
        <ConfirmModal message="Voulez-vous vraiment supprimer ce cours ?"
          onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
      )}

      {etudiantsCoursId && (
        <EtudiantsModal coursId={etudiantsCoursId} onClose={() => setEtudiantsCoursId(null)} />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Nouveau cours</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Module *</label>
                <select required value={form.module_id}
                  onChange={e => setForm({ ...form, module_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Choisir un module --</option>
                  {modules.map(m => <option key={m.id} value={m.id}>{m.libelle}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Professeur *</label>
                <select required value={form.professeur_id}
                  onChange={e => setForm({ ...form, professeur_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Choisir un professeur --</option>
                  {profs.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Semestre *</label>
                <select required value={form.semestre_id}
                  onChange={e => setForm({ ...form, semestre_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Choisir un semestre --</option>
                  {semestres.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quota horaire (heures) *</label>
                <input required type="number" min="1" value={form.quota_horaire_global}
                  onChange={e => setForm({ ...form, quota_horaire_global: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: 30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Classes * (sélection multiple)</label>
                <div className="border rounded-lg p-3 grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                  {classes.map(cl => (
                    <label key={cl.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.classes.includes(cl.id)}
                        onChange={() => toggleClasse(cl.id)} className="accent-blue-600" />
                      {cl.libelle}
                    </label>
                  ))}
                  {classes.length === 0 && <p className="text-gray-400 text-xs col-span-2">Aucune classe disponible</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={saving || form.classes.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2 text-sm font-medium">
                  {saving ? 'Enregistrement...' : 'Créer le cours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

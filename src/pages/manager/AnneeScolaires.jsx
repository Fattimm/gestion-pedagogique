import { useEffect, useState } from 'react';
import {
  getAnneeScolaires, createAnneeScolaire, updateAnneeScolaire, deleteAnneeScolaire,
  getClasses, getClassesAnnee, planifierClasseAnnee, retirerClasseAnnee,
} from '../../api/referentielApi';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';

const empty = { libelle: '', date_debut: '', date_fin: '', etat: 'planifiee' };

const ETAT = {
  planifiee: { label: 'Planifiée', cls: 'bg-gray-100 text-gray-600' },
  en_cours:  { label: 'En cours',  cls: 'bg-green-100 text-green-700' },
  terminee:  { label: 'Terminée',  cls: 'bg-blue-100 text-blue-700' },
};

function AnneeModal({ title, data, setData, onSubmit, onClose, saving, error }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">&times;</button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input required placeholder="Libellé (ex: 2025-2026)" value={data.libelle}
            onChange={e => setData({ ...data, libelle: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Date début *</label>
              <input required type="date" value={data.date_debut?.split('T')[0] ?? ''}
                onChange={e => setData({ ...data, date_debut: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Date fin *</label>
              <input required type="date" value={data.date_fin?.split('T')[0] ?? ''}
                onChange={e => setData({ ...data, date_fin: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">État</label>
            <select value={data.etat} onChange={e => setData({ ...data, etat: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2 text-sm font-medium">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClassesModal({ annee, onClose }) {
  const [toutesClasses, setToutesClasses]   = useState([]);
  const [classesAnnee, setClassesAnnee]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(null);

  useEffect(() => {
    Promise.all([getClasses(), getClassesAnnee(annee.id)])
      .then(([allRes, anneeRes]) => {
        setToutesClasses(allRes.data.data ?? allRes.data ?? []);
        setClassesAnnee((anneeRes.data.data ?? anneeRes.data ?? []).map(c => c.id));
      })
      .finally(() => setLoading(false));
  }, [annee.id]);

  const handleToggle = async (classeId) => {
    setSaving(classeId);
    try {
      if (classesAnnee.includes(classeId)) {
        await retirerClasseAnnee(annee.id, classeId);
        setClassesAnnee(prev => prev.filter(id => id !== classeId));
      } else {
        await planifierClasseAnnee(annee.id, classeId);
        setClassesAnnee(prev => [...prev, classeId]);
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-gray-800">Classes — {annee.libelle}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Cochez les classes assignées à cette année scolaire.</p>

        {loading ? (
          <p className="text-gray-500 text-sm">Chargement...</p>
        ) : (
          <div className="overflow-y-auto flex-1 space-y-2">
            {toutesClasses.length === 0 && <p className="text-gray-400 text-sm">Aucune classe disponible.</p>}
            {toutesClasses.map(cl => {
              const isIn = classesAnnee.includes(cl.id);
              return (
                <label key={cl.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    isIn ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  } ${saving === cl.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="checkbox" checked={isIn}
                    onChange={() => handleToggle(cl.id)}
                    className="accent-blue-600 w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">{cl.libelle}</span>
                  {saving === cl.id && <span className="ml-auto text-xs text-gray-400">...</span>}
                </label>
              );
            })}
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

export default function AnneeScolaires() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [showEdit, setShowEdit]     = useState(false);
  const [classesAnnee, setClassesAnnee] = useState(null);
  const [form, setForm]             = useState(empty);
  const [editForm, setEditForm]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [confirmId, setConfirmId]   = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getAnneeScolaires();
      setItems(res.data.data ?? res.data ?? []);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createAnneeScolaire(form);
      setShowModal(false); setForm(empty); fetchItems();
    } catch (err) { setError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await updateAnneeScolaire(editForm.id, editForm);
      setShowEdit(false); fetchItems();
    } catch (err) { setError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await deleteAnneeScolaire(confirmId);
    setConfirmId(null); fetchItems();
  };

  return (
    <div>
      <PageHeader title="Années scolaires"
        action={{ label: '+ Nouvelle année', onClick: () => { setShowModal(true); setError(''); } }} />

      {loading ? <p className="text-gray-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Libellé</th>
                <th className="px-6 py-3 text-left">Début</th>
                <th className="px-6 py-3 text-left">Fin</th>
                <th className="px-6 py-3 text-left">État</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucune année scolaire.</td></tr>
              )}
              {items.map(item => {
                const e = ETAT[item.etat] ?? { label: item.etat, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{item.libelle}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(item.date_debut).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(item.date_fin).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${e.cls}`}>{e.label}</span>
                    </td>
                    <td className="px-6 py-4 flex gap-3">
                      <button onClick={() => setClassesAnnee(item)}
                        className="text-blue-600 hover:underline text-sm">Classes</button>
                      <button onClick={() => { setEditForm(item); setShowEdit(true); setError(''); }}
                        className="text-gray-600 hover:underline text-sm">Modifier</button>
                      <button onClick={() => setConfirmId(item.id)}
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
        <ConfirmModal message="Supprimer cette année scolaire ?"
          onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />
      )}

      {classesAnnee && (
        <ClassesModal annee={classesAnnee} onClose={() => setClassesAnnee(null)} />
      )}

      {showModal && (
        <AnneeModal title="Nouvelle année scolaire" data={form} setData={setForm}
          onSubmit={handleCreate} onClose={() => setShowModal(false)} saving={saving} error={error} />
      )}

      {showEdit && editForm && (
        <AnneeModal title="Modifier l'année scolaire" data={editForm} setData={setEditForm}
          onSubmit={handleEdit} onClose={() => setShowEdit(false)} saving={saving} error={error} />
      )}
    </div>
  );
}

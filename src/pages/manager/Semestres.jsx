import { useEffect, useState } from 'react';
import { getSemestres, createSemestre, updateSemestre, deleteSemestre, getAnneeScolaires } from '../../api/referentielApi';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';

const empty = { libelle: '', date_debut: '', date_fin: '', annee_scolaire_id: '' };

function SemestreModal({ title, data, setData, onSubmit, onClose, saving, error, annees }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 text-xl">&times;</button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input required placeholder="Libellé (ex: Semestre 1)" value={data.libelle}
            onChange={e => setData({ ...data, libelle: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm" />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Année scolaire *</label>
            <select required value={data.annee_scolaire_id}
              onChange={e => setData({ ...data, annee_scolaire_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">-- Choisir --</option>
              {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
            </select>
          </div>
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

export default function Semestres() {
  const [items, setItems]         = useState([]);
  const [annees, setAnnees]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit]   = useState(false);
  const [form, setForm]           = useState(empty);
  const [editForm, setEditForm]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchItems();
    getAnneeScolaires().then(res => setAnnees(res.data.data ?? res.data ?? []));
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getSemestres();
      setItems(res.data.data ?? res.data ?? []);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createSemestre({ ...form, annee_scolaire_id: Number(form.annee_scolaire_id) });
      setShowModal(false); setForm(empty); fetchItems();
    } catch (err) { setError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await updateSemestre(editForm.id, { ...editForm, annee_scolaire_id: Number(editForm.annee_scolaire_id) });
      setShowEdit(false); fetchItems();
    } catch (err) { setError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await deleteSemestre(confirmId);
    setConfirmId(null); fetchItems();
  };

  return (
    <div>
      <PageHeader title="Semestres"
        action={{ label: '+ Nouveau semestre', onClick: () => { setShowModal(true); setError(''); } }} />

      {loading ? <p className="text-gray-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Libellé</th>
                <th className="px-6 py-3 text-left">Année scolaire</th>
                <th className="px-6 py-3 text-left">Début</th>
                <th className="px-6 py-3 text-left">Fin</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Aucun semestre.</td></tr>}
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {item.annee_scolaire?.libelle ?? annees.find(a => a.id === item.annee_scolaire_id)?.libelle ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(item.date_debut).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(item.date_fin).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 flex gap-3">
                    <button onClick={() => { setEditForm(item); setShowEdit(true); setError(''); }}
                      className="text-blue-600 hover:underline text-sm">Modifier</button>
                    <button onClick={() => setConfirmId(item.id)}
                      className="text-red-500 hover:underline text-sm">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmId && <ConfirmModal message="Supprimer ce semestre ?" onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}

      {showModal && (
        <SemestreModal title="Nouveau semestre" data={form} setData={setForm}
          onSubmit={handleCreate} onClose={() => setShowModal(false)} saving={saving} error={error} annees={annees} />
      )}

      {showEdit && editForm && (
        <SemestreModal title="Modifier le semestre" data={editForm} setData={setEditForm}
          onSubmit={handleEdit} onClose={() => setShowEdit(false)} saving={saving} error={error} annees={annees} />
      )}
    </div>
  );
}

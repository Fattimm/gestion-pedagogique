import { useEffect, useState } from 'react';
import { getModules, createModule, updateModule, deleteModule } from '../../api/referentielApi';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';

const empty = { libelle: '', description: '' };

export default function Modules() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [form, setForm]         = useState(empty);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [confirmId, setConfirmId]     = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getModules();
      setItems(res.data.data ?? res.data ?? []);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createModule(form);
      setShowModal(false); setForm(empty); fetchItems();
    } catch (err) { setError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await updateModule(editForm.id, editForm);
      setShowEdit(false); fetchItems();
    } catch (err) { setError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await deleteModule(confirmId);
    setConfirmId(null); fetchItems();
  };

  return (
    <div>
      <PageHeader title="Modules"
        action={{ label: '+ Nouveau module', onClick: () => { setShowModal(true); setError(''); } }} />

      {loading ? <p className="text-gray-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Libellé</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 && <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-400">Aucun module.</td></tr>}
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">{item.description ?? '—'}</td>
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

      {confirmId && <ConfirmModal message="Supprimer ce module ?" onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Nouveau module</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-xl">&times;</button>
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Libellé" value={form.libelle}
                onChange={e => setForm({...form, libelle: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Description (optionnel)" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2 text-sm font-medium">
                  {saving ? 'Enregistrement...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Modifier le module</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 text-xl">&times;</button>
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <form onSubmit={handleEdit} className="space-y-3">
              <input required placeholder="Libellé" value={editForm.libelle}
                onChange={e => setEditForm({...editForm, libelle: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={editForm.description ?? ''}
                onChange={e => setEditForm({...editForm, description: e.target.value})}
                rows={3} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2 text-sm font-medium">
                  {saving ? 'Enregistrement...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

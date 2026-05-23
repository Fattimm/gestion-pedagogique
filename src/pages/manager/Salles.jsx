import { useEffect, useState } from 'react';
import { getSalles, createSalle, updateSalle, deleteSalle } from '../../api/referentielApi';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';

const empty = { nom: '', numero: '', nombre_places: '' };

export default function Salles() {
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
      const res = await getSalles();
      setItems(res.data.data ?? res.data ?? []);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createSalle({ ...form, nombre_places: Number(form.nombre_places) });
      setShowModal(false); setForm(empty); fetchItems();
    } catch (err) { setError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await updateSalle(editForm.id, { ...editForm, nombre_places: Number(editForm.nombre_places) });
      setShowEdit(false); fetchItems();
    } catch (err) { setError(err.response?.data?.message ?? 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await deleteSalle(confirmId);
    setConfirmId(null); fetchItems();
  };

  return (
    <div>
      <PageHeader title="Salles"
        action={{ label: '+ Nouvelle salle', onClick: () => { setShowModal(true); setError(''); } }} />

      {loading ? <p className="text-gray-500">Chargement...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Numéro</th>
                <th className="px-6 py-3 text-left">Places</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Aucune salle.</td></tr>}
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.nom}</td>
                  <td className="px-6 py-4 text-gray-500">{item.numero}</td>
                  <td className="px-6 py-4 text-gray-500">{item.nombre_places}</td>
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

      {confirmId && <ConfirmModal message="Supprimer cette salle ?" onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Nouvelle salle</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 text-xl">&times;</button>
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Nom (ex: Amphi A)" value={form.nom}
                onChange={e => setForm({...form, nom: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Numéro (ex: A01)" value={form.numero}
                onChange={e => setForm({...form, numero: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input required type="number" min="1" placeholder="Nombre de places" value={form.nombre_places}
                onChange={e => setForm({...form, nombre_places: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
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
              <h2 className="text-lg font-bold">Modifier la salle</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 text-xl">&times;</button>
            </div>
            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
            <form onSubmit={handleEdit} className="space-y-3">
              <input required placeholder="Nom" value={editForm.nom}
                onChange={e => setEditForm({...editForm, nom: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Numéro" value={editForm.numero}
                onChange={e => setEditForm({...editForm, numero: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input required type="number" min="1" placeholder="Nombre de places" value={editForm.nombre_places}
                onChange={e => setEditForm({...editForm, nombre_places: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
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

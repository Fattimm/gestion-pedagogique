import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/usersApi';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    prenom: '', nom: '', login: '', email: '', password: '', role: 'APPRENANT', telephone: ''
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers(roleFilter || undefined);
      setUsers(res.data.users);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await createUser(form);
      setShowModal(false);
      setForm({ prenom: '', nom: '', login: '', email: '', password: '', role: 'APPRENANT', telephone: '' });
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const data = { ...editForm };
      if (!data.password) delete data.password;
      await updateUser(editForm.id, data);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteUser(confirmId);
    setConfirmId(null);
    fetchUsers();
  };

  return (
    <div>
      <PageHeader title="Utilisateurs"
        action={{ label: '+ Nouvel utilisateur', onClick: () => setShowModal(true) }}>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm">
          <option value="">Tous les rôles</option>
          <option value="MANAGER">Manager</option>
          <option value="CM">CM</option>
          <option value="COACH">Coach</option>
          <option value="APPRENANT">Apprenant</option>
        </select>
      </PageHeader>

      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Login</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Rôle</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{user.prenom} {user.nom}</td>
                  <td className="px-6 py-4 text-gray-500">{user.login}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button
                      onClick={() => { setEditForm(user); setShowEditModal(true); }}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => setConfirmId(user.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Créer */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Nouvel utilisateur</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="flex gap-3">
                <input required placeholder="Prénom" value={form.prenom}
                  onChange={e => setForm({...form, prenom: e.target.value})}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <input required placeholder="Nom" value={form.nom}
                  onChange={e => setForm({...form, nom: e.target.value})}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              </div>
              <input required placeholder="Login" value={form.login}
                onChange={e => setForm({...form, login: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input required type="email" placeholder="Email" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input required type="password" placeholder="Mot de passe" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Téléphone" value={form.telephone}
                onChange={e => setForm({...form, telephone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="APPRENANT">Étudiant</option>
                <option value="COACH">Professeur</option>
                <option value="CM">Attaché de direction</option>
                <option value="MANAGER">Manager</option>
              </select>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2 text-sm font-medium">
                  {saving ? 'Enregistrement...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmId && (
        <ConfirmModal
          message="Voulez-vous vraiment supprimer cet utilisateur ?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Modal Modifier */}
      {showEditModal && editForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Modifier l'utilisateur</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}

            <form onSubmit={handleEdit} className="space-y-3">
              <div className="flex gap-3">
                <input required placeholder="Prénom" value={editForm.prenom}
                  onChange={e => setEditForm({...editForm, prenom: e.target.value})}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <input required placeholder="Nom" value={editForm.nom}
                  onChange={e => setEditForm({...editForm, nom: e.target.value})}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" />
              </div>
              <input required placeholder="Login" value={editForm.login}
                onChange={e => setEditForm({...editForm, login: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input required type="email" placeholder="Email" value={editForm.email}
                onChange={e => setEditForm({...editForm, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <input type="password" placeholder="Nouveau mot de passe (laisser vide = inchangé)"
                value={editForm.password ?? ''}
                onChange={e => setEditForm({...editForm, password: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
              <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="APPRENANT">Étudiant</option>
                <option value="COACH">Professeur</option>
                <option value="CM">Attaché de direction</option>
                <option value="MANAGER">Manager</option>
              </select>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
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

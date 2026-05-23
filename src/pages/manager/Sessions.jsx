import { useEffect, useState } from 'react';
import { getCours, getSessionsDuCours, planifierSession, updateSession, annulerSession } from '../../api/coursApi';
import { getSalles } from '../../api/referentielApi';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';

const STATUT = {
  planifiee: { label: 'Planifiée', cls: 'bg-yellow-100 text-yellow-700' },
  effectuee: { label: 'Effectuée', cls: 'bg-green-100 text-green-700' },
  annulee:   { label: 'Annulée',   cls: 'bg-red-100 text-red-700' },
};

const emptyForm = {
  cours_id: '', date: '', heure_debut: '', heure_fin: '',
  nbre_heure: '', type: 'presentiel', salle_id: '',
};

function SessionModal({ title, form, setForm, cours, salles, onSubmit, onClose, saving, error }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cours *</label>
            <select required value={form.cours_id}
              onChange={e => setForm({ ...form, cours_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">-- Choisir un cours --</option>
              {cours.map(c => (
                <option key={c.id} value={c.id}>
                  {c.module?.libelle} — {c.professeur?.prenom} {c.professeur?.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
            <input required type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Heure début *</label>
              <input required type="time" value={form.heure_debut}
                onChange={e => setForm({ ...form, heure_debut: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Heure fin *</label>
              <input required type="time" value={form.heure_fin}
                onChange={e => setForm({ ...form, heure_fin: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Durée (heures) *</label>
            <input required type="number" min="0.5" step="0.5" value={form.nbre_heure}
              onChange={e => setForm({ ...form, nbre_heure: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Ex: 2" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
            <select value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value, salle_id: '' })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="presentiel">Présentiel</option>
              <option value="en_ligne">En ligne</option>
            </select>
          </div>
          {form.type === 'presentiel' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Salle *</label>
              <select required value={form.salle_id}
                onChange={e => setForm({ ...form, salle_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="">-- Choisir une salle --</option>
                {salles.map(s => <option key={s.id} value={s.id}>{s.nom} ({s.numero})</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
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

export default function Sessions() {
  const [cours, setCours]               = useState([]);
  const [sessions, setSessions]         = useState([]);
  const [selectedCours, setSelectedCours] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [loading, setLoading]           = useState(false);
  const [salles, setSalles]             = useState([]);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState('');
  const [confirmId, setConfirmId]       = useState(null);

  const [showCreate, setShowCreate]     = useState(false);
  const [showEdit, setShowEdit]         = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [editForm, setEditForm]         = useState(null);

  useEffect(() => {
    getCours().then(res => setCours(res.data.data ?? []));
    getSalles().then(res => setSalles(res.data.data ?? res.data ?? []));
  }, []);

  useEffect(() => {
    if (!selectedCours) { setSessions([]); return; }
    chargerSessions();
  }, [selectedCours]);

  const chargerSessions = () => {
    setLoading(true);
    getSessionsDuCours(selectedCours)
      .then(res => setSessions(res.data.data ?? []))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      await planifierSession({
        ...form,
        cours_id:   Number(form.cours_id),
        nbre_heure: Number(form.nbre_heure),
        salle_id:   form.type === 'presentiel' ? Number(form.salle_id) : null,
      });
      setShowCreate(false);
      setForm(emptyForm);
      if (String(form.cours_id) === String(selectedCours)) chargerSessions();
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Erreur lors de la planification');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormError('');
    try {
      await updateSession(editForm.id, {
        date:        editForm.date,
        heure_debut: editForm.heure_debut,
        heure_fin:   editForm.heure_fin,
        nbre_heure:  Number(editForm.nbre_heure),
        type:        editForm.type,
        salle_id:    editForm.type === 'presentiel' ? Number(editForm.salle_id) || null : null,
        cours_id:    Number(editForm.cours_id),
      });
      setShowEdit(false);
      chargerSessions();
    } catch (err) {
      setFormError(err.response?.data?.message ?? 'Erreur lors de la modification');
    } finally { setSaving(false); }
  };

  const handleAnnuler = async () => {
    await annulerSession(confirmId);
    setConfirmId(null);
    chargerSessions();
  };

  const openEdit = (s) => {
    setEditForm({
      id:          s.id,
      cours_id:    s.cours_id,
      date:        s.date?.split('T')[0] ?? s.date,
      heure_debut: s.heure_debut?.slice(0, 5),
      heure_fin:   s.heure_fin?.slice(0, 5),
      nbre_heure:  s.nbre_heure,
      type:        s.type,
      salle_id:    s.salle_id ?? '',
    });
    setFormError('');
    setShowEdit(true);
  };

  const displayed = sessions.filter(s => !statutFilter || s.statut === statutFilter);

  return (
    <div>
      <PageHeader title="Sessions"
        action={{ label: '+ Planifier une session', onClick: () => { setForm({ ...emptyForm, cours_id: selectedCours }); setFormError(''); setShowCreate(true); } }}>
        <select value={selectedCours} onChange={e => setSelectedCours(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm flex-1">
          <option value="">-- Sélectionner un cours --</option>
          {cours.map(c => (
            <option key={c.id} value={c.id}>
              {c.module?.libelle} — {c.professeur?.prenom} {c.professeur?.nom}
            </option>
          ))}
        </select>
        <select value={statutFilter} onChange={e => setStatutFilter(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm">
          <option value="">Tous les statuts</option>
          <option value="planifiee">Planifiée</option>
          <option value="effectuee">Effectuée</option>
          <option value="annulee">Annulée</option>
        </select>
      </PageHeader>

      {!selectedCours && <p className="text-gray-400">Sélectionnez un cours pour voir ses sessions.</p>}
      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && selectedCours && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Horaire</th>
                <th className="px-6 py-3 text-left">Durée</th>
                <th className="px-6 py-3 text-left">Type</th>
                <th className="px-6 py-3 text-left">Salle</th>
                <th className="px-6 py-3 text-left">Statut</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayed.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Aucune session trouvée.</td></tr>
              ) : displayed.map(s => {
                const st = STATUT[s.statut] ?? { label: s.statut, cls: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{new Date(s.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 text-gray-500">{s.heure_debut?.slice(0,5)} — {s.heure_fin?.slice(0,5)}</td>
                    <td className="px-6 py-4 text-gray-500">{s.nbre_heure}h</td>
                    <td className="px-6 py-4 text-gray-500 capitalize">{s.type}</td>
                    <td className="px-6 py-4 text-gray-500">{s.salle?.nom ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      {s.statut === 'planifiee' && (
                        <>
                          <button onClick={() => openEdit(s)}
                            className="text-blue-600 hover:underline text-sm">Modifier</button>
                          <button onClick={() => setConfirmId(s.id)}
                            className="text-red-500 hover:underline text-sm">Annuler</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmId && (
        <ConfirmModal message="Voulez-vous vraiment annuler cette session ?"
          onConfirm={handleAnnuler} onCancel={() => setConfirmId(null)} />
      )}

      {showCreate && (
        <SessionModal title="Planifier une session" form={form} setForm={setForm}
          cours={cours} salles={salles} onSubmit={handleCreate}
          onClose={() => setShowCreate(false)} saving={saving} error={formError} />
      )}

      {showEdit && editForm && (
        <SessionModal title="Modifier la session" form={editForm} setForm={setEditForm}
          cours={cours} salles={salles} onSubmit={handleEdit}
          onClose={() => setShowEdit(false)} saving={saving} error={formError} />
      )}
    </div>
  );
}

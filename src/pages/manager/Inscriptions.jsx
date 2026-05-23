import { useEffect, useState } from 'react';
import { getInscriptions, importerEtudiants, deleteInscription } from '../../api/inscriptionsApi';
import { getClasses, getAnneeScolaires } from '../../api/referentielApi';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';

export default function Inscriptions() {
  const [inscriptions, setInscriptions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [classes, setClasses]             = useState([]);
  const [annees, setAnnees]               = useState([]);
  const [classeFilter, setClasseFilter]   = useState('');
  const [anneeFilter, setAnneeFilter]     = useState('');

  const [showModal, setShowModal]         = useState(false);
  const [fichier, setFichier]             = useState(null);
  const [importClasse, setImportClasse]   = useState('');
  const [importAnnee, setImportAnnee]     = useState('');
  const [importing, setImporting]         = useState(false);
  const [importMsg, setImportMsg]         = useState('');

  const [confirmId, setConfirmId]         = useState(null);

  useEffect(() => {
    getClasses().then(res => setClasses(res.data.data ?? res.data ?? []));
    getAnneeScolaires().then(res => setAnnees(res.data.data ?? res.data ?? []));
  }, []);

  useEffect(() => { fetchInscriptions(); }, [classeFilter, anneeFilter]);

  const fetchInscriptions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (classeFilter) params.classe_id = classeFilter;
      if (anneeFilter)  params.annee_scolaire_id = anneeFilter;
      const res = await getInscriptions(params);
      setInscriptions(res.data.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!fichier) return;
    setImporting(true);
    setImportMsg('');
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);
      formData.append('classe_id', importClasse);
      formData.append('annee_scolaire_id', importAnnee);
      const res = await importerEtudiants(formData);
      const erreurs = res.data.erreurs ?? [];
      setImportMsg(
        erreurs.length > 0
          ? `Importé avec ${erreurs.length} erreur(s) : ${erreurs.join(', ')}`
          : 'Importation réussie !'
      );
      fetchInscriptions();
    } catch (err) {
      setImportMsg(err.response?.data?.message ?? "Erreur lors de l'importation");
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async () => {
    await deleteInscription(confirmId);
    setConfirmId(null);
    fetchInscriptions();
  };

  return (
    <div>
      <PageHeader title="Inscriptions"
        action={{ label: '+ Importer des étudiants', onClick: () => { setShowModal(true); setImportMsg(''); } }}>
        <select value={classeFilter} onChange={e => setClasseFilter(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm flex-1">
          <option value="">Toutes les classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
        </select>
        <select value={anneeFilter} onChange={e => setAnneeFilter(e.target.value)}
          className="bg-white text-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none shadow-sm flex-1">
          <option value="">Toutes les années</option>
          {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
        </select>
      </PageHeader>

      {/* Tableau */}
      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Étudiant</th>
                <th className="px-6 py-3 text-left">Login</th>
                <th className="px-6 py-3 text-left">Classe</th>
                <th className="px-6 py-3 text-left">Année scolaire</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Aucune inscription trouvée.
                  </td>
                </tr>
              ) : inscriptions.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{i.etudiant?.prenom} {i.etudiant?.nom}</td>
                  <td className="px-6 py-4 text-gray-500">{i.etudiant?.login}</td>
                  <td className="px-6 py-4 text-gray-500">{i.classe?.libelle}</td>
                  <td className="px-6 py-4 text-gray-500">{i.annee_scolaire?.libelle}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setConfirmId(i.id)}
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

      {/* Confirm */}
      {confirmId && (
        <ConfirmModal
          message="Voulez-vous vraiment supprimer cette inscription ?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Modal Import */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Importer des étudiants</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Fichier Excel (.xlsx / .xls / .csv) avec les colonnes : <strong>prenom, nom, login, email, password</strong>
            </p>

            {importMsg && (
              <p className={`text-sm mb-3 ${importMsg.includes('erreur') ? 'text-red-600' : 'text-green-600'}`}>
                {importMsg}
              </p>
            )}

            <form onSubmit={handleImport} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Classe *</label>
                <select required value={importClasse}
                  onChange={e => setImportClasse(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Choisir une classe --</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.libelle}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Année scolaire *</label>
                <select required value={importAnnee}
                  onChange={e => setImportAnnee(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Choisir une année --</option>
                  {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fichier *</label>
                <input required type="file" accept=".xlsx,.xls,.csv"
                  onChange={e => setFichier(e.target.files[0])}
                  className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                  Fermer
                </button>
                <button type="submit" disabled={importing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg py-2 text-sm font-medium">
                  {importing ? 'Importation...' : 'Importer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { demanderReset, reinitialiserMdp } from '../api/authApi';

export default function MotDePasseOublie() {
  const navigate = useNavigate();

  const [etape, setEtape]       = useState(1); // 1 = saisir login | 2 = saisir code + mdp
  const [login, setLogin]       = useState('');
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [debugCode, setDebugCode] = useState(''); // à retirer en production

  const handleDemander = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await demanderReset(login);
      setDebugCode(res.data.debug_code ?? '');
      setEtape(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiant introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const handleReinit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await reinitialiserMdp({ login, code, password, password_confirmation: confirm });
      navigate('/login', { state: { message: 'Mot de passe réinitialisé. Connectez-vous.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">

        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          {etape === 1 ? 'Mot de passe oublié' : 'Réinitialiser le mot de passe'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {etape === 1
            ? 'Entrez votre identifiant de connexion pour recevoir un code.'
            : 'Entrez le code reçu et votre nouveau mot de passe.'}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Étape 1 : saisir le login */}
        {etape === 1 && (
          <form onSubmit={handleDemander} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                placeholder="Votre identifiant de connexion"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </button>
          </form>
        )}

        {/* Étape 2 : saisir le code + nouveau mdp */}
        {etape === 2 && (
          <form onSubmit={handleReinit} className="space-y-4">
            {debugCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
                <span className="font-semibold">Code de réinitialisation :</span>{' '}
                <span className="font-mono text-lg tracking-widest">{debugCode}</span>
                <p className="text-xs mt-1 text-yellow-600">Ce message disparaît une fois le mailer configuré.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code reçu</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Code à 6 chiffres"
                maxLength={6}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Répétez le mot de passe"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
            <button type="button" onClick={() => { setEtape(1); setError(''); setCode(''); }}
              className="w-full text-sm text-gray-500 hover:text-gray-700">
              ← Changer d'identifiant
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-blue-600 hover:underline">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}

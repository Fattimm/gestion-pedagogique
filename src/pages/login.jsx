import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const successMessage = location.state?.message ?? '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form.login, form.password);
      const { accessToken, user } = res.data.data;
      const token = accessToken.accessToken ?? accessToken;
      setAuth(token, user);
      const routes = {
        MANAGER: '/manager',
        CM: '/cm',
        COACH: '/coach',
        APPRENANT: '/etudiant',
      };
      navigate(routes[user.role] ?? '/');
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche — image + overlay */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
          alt="Étudiants"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900 opacity-40" />

        <div className="relative z-10">
          <h1 className="text-white text-3xl font-bold tracking-wide">Ecole 221</h1>
          <p className="text-blue-200 mt-2 text-sm">Plateforme de gestion pédagogique</p>
        </div>

        <div className="relative z-10 text-center">
          <p className="text-white text-xl font-medium">Bienvenue sur votre espace</p>
          <p className="text-blue-200 text-sm mt-2">
            Gérez vos cours, absences et émargements en toute simplicité.
          </p>
        </div>

        <p className="relative z-10 text-blue-300 text-xs">
          © 2026 Ecole 221. Tous droits réservés.
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-blue-600">Connexion</h2>
            <p className="text-gray-500 text-sm mt-1">Accédez à votre espace personnel</p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identifiant
              </label>
              <input
                type="text"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                placeholder="Votre identifiant"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link to="/mot-de-passe-oublie" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition">
              Mot de passe oublié ?
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Ecole 221 &mdash; Système de gestion pédagogique
          </p>
        </div>
      </div>
    </div>
  );
}

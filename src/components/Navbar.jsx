import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.get('/logout');
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="text-blue-700 font-bold text-lg">Ecole 221</div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{user?.prenom} {user?.nom}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

export default function Sidebar({ links }) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.get('/logout');
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 min-h-screen bg-blue-800 text-white flex flex-col">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-xl font-bold">Ecole 221</h1>
        <p className="text-sm text-blue-300 mt-1">{user?.prenom} {user?.nom}</p>
        <span className="text-xs bg-blue-600 px-2 py-0.5 rounded mt-1 inline-block">{user?.role}</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm transition ${
                isActive ? 'bg-blue-600 font-semibold' : 'hover:bg-blue-700'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full text-sm bg-red-500 hover:bg-red-600 py-2 rounded-lg transition"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}

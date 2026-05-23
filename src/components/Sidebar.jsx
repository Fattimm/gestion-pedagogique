import { NavLink } from 'react-router-dom';

export default function Sidebar({ links }) {
  return (
    <div className="w-56 min-h-screen bg-blue-800 text-white flex flex-col">
      <nav className="flex-1 p-4 space-y-1 pt-6">
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
    </div>
  );
}

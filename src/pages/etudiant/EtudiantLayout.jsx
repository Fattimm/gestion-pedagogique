import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const links = [
  { to: '/etudiant/mes-cours', label: 'Mes cours' },
  { to: '/etudiant/mes-sessions', label: 'Mes sessions' },
  { to: '/etudiant/mes-absences', label: 'Mes absences' },
];

export default function EtudiantLayout() {
  return (
    <div className="flex">
      <Sidebar links={links} />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

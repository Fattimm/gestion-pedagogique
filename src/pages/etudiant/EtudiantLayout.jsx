import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const links = [
  { to: '/etudiant/mes-cours', label: 'Mes cours' },
  { to: '/etudiant/mes-sessions', label: 'Mes sessions' },
  { to: '/etudiant/mes-absences', label: 'Mes absences' },
];

export default function EtudiantLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar links={links} />
        <main className="flex-1 p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

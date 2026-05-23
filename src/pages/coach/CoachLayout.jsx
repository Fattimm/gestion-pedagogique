import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

const links = [
  { to: '/coach/mes-cours', label: 'Mes cours' },
  { to: '/coach/mes-sessions', label: 'Mes sessions' },
  { to: '/coach/heures', label: 'Mes heures' },
];

export default function CoachLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar links={links} />
        <main className="flex-1 p-8 bg-gray-50 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

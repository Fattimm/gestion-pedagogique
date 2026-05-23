import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const links = [
  { to: '/manager/dashboard',      label: 'Tableau de bord' },
  { to: '/manager/users',          label: 'Utilisateurs' },
  { to: '/manager/cours',          label: 'Cours' },
  { to: '/manager/sessions',       label: 'Sessions' },
  { to: '/manager/inscriptions',   label: 'Inscriptions' },
  { to: '/manager/classes',        label: 'Classes' },
  { to: '/manager/salles',         label: 'Salles' },
  { to: '/manager/modules',        label: 'Modules' },
  { to: '/manager/semestres',      label: 'Semestres' },
  { to: '/manager/annees',         label: 'Années scolaires' },
];

export default function ManagerLayout() {
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

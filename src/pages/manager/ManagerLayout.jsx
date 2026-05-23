import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const links = [
  { to: '/manager/users', label: 'Utilisateurs' },
  { to: '/manager/cours', label: 'Cours' },
  { to: '/manager/sessions', label: 'Sessions' },
  { to: '/manager/inscriptions', label: 'Inscriptions' },
];

export default function ManagerLayout() {
  return (
    <div className="flex">
      <Sidebar links={links} />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

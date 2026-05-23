import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

const links = [
  { to: '/cm/sessions', label: 'Sessions' },
  { to: '/cm/absences', label: 'Absences' },
  { to: '/cm/bilan', label: 'Bilan professeurs' },
];

export default function CmLayout() {
  return (
    <div className="flex">
      <Sidebar links={links} />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getUsers } from '../../api/usersApi';
import { getCours } from '../../api/coursApi';
import { useAuthStore } from '../../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ users: 0, profs: 0, etudiants: 0, cours: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allUsers, profs, etudiants, coursRes] = await Promise.all([
          getUsers(),
          getUsers('COACH'),
          getUsers('APPRENANT'),
          getCours(),
        ]);
        setStats({
          users: allUsers.data.users?.length ?? 0,
          profs: profs.data.users?.length ?? 0,
          etudiants: etudiants.data.users?.length ?? 0,
          cours: coursRes.data.data?.length ?? 0,
        });
      } catch {}
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Utilisateurs', value: stats.users, color: 'bg-blue-500' },
    { label: 'Professeurs', value: stats.profs, color: 'bg-green-500' },
    { label: 'Étudiants', value: stats.etudiants, color: 'bg-purple-500' },
    { label: 'Cours', value: stats.cours, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bonjour, {user?.prenom} {user?.nom}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Voici un aperçu de votre plateforme</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center text-white text-xl font-bold`}>
              {card.value}
            </div>
            <div>
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

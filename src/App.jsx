import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import ManagerLayout from './pages/manager/ManagerLayout';
import Users from './pages/manager/Users';
import Cours from './pages/manager/Cours';
import Sessions from './pages/manager/Sessions';
import Inscriptions from './pages/manager/Inscriptions';
import CmLayout from './pages/cm/CmLayout';
import CmSessions from './pages/cm/Sessions';
import CmAbsences from './pages/cm/Absences';
import CmBilan from './pages/cm/Bilan';
import CoachLayout from './pages/coach/CoachLayout';
import MesCours from './pages/coach/MesCours';
import MesSessions from './pages/coach/MesSessions';
import MesHeures from './pages/coach/MesHeures';
import EtudiantLayout from './pages/etudiant/EtudiantLayout';
import EtudiantMesCours from './pages/etudiant/MesCours';
import EtudiantMesSessions from './pages/etudiant/MesSessions';
import MesAbsences from './pages/etudiant/MesAbsences';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* MANAGER */}
        <Route path="/manager" element={
          <PrivateRoute roles={['MANAGER']}>
            <ManagerLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<Users />} />
          <Route path="cours" element={<Cours />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="inscriptions" element={<Inscriptions />} />
        </Route>

        {/* CM */}
        <Route path="/cm" element={
          <PrivateRoute roles={['CM']}>
            <CmLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="sessions" replace />} />
          <Route path="sessions" element={<CmSessions />} />
          <Route path="absences" element={<CmAbsences />} />
          <Route path="bilan" element={<CmBilan />} />
        </Route>

        {/* COACH */}
        <Route path="/coach" element={
          <PrivateRoute roles={['COACH']}>
            <CoachLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="mes-cours" replace />} />
          <Route path="mes-cours" element={<MesCours />} />
          <Route path="mes-sessions" element={<MesSessions />} />
          <Route path="heures" element={<MesHeures />} />
        </Route>

        {/* ETUDIANT */}
        <Route path="/etudiant" element={
          <PrivateRoute roles={['APPRENANT']}>
            <EtudiantLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="mes-cours" replace />} />
          <Route path="mes-cours" element={<EtudiantMesCours />} />
          <Route path="mes-sessions" element={<EtudiantMesSessions />} />
          <Route path="mes-absences" element={<MesAbsences />} />
        </Route>


        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

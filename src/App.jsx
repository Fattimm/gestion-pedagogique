import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/manager" element={
          <PrivateRoute roles={['MANAGER']}>
            <div className="p-8 text-2xl font-bold">Dashboard Manager</div>
          </PrivateRoute>
        } />

        <Route path="/cm" element={
          <PrivateRoute roles={['CM']}>
            <div className="p-8 text-2xl font-bold">Dashboard CM</div>
          </PrivateRoute>
        } />

        <Route path="/coach" element={
          <PrivateRoute roles={['COACH']}>
            <div className="p-8 text-2xl font-bold">Dashboard Coach</div>
          </PrivateRoute>
        } />

        <Route path="/etudiant" element={
          <PrivateRoute roles={['APPRENANT']}>
            <div className="p-8 text-2xl font-bold">Dashboard Étudiant</div>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

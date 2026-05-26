import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import GenomeLab from './pages/GenomeLab';
import DarkMatter from './pages/DarkMatter';
import ImmuneCenter from './pages/ImmuneCenter';
import MetabolicRate from './pages/MetabolicRate';
import CognitiveLoad from './pages/CognitiveLoad';
import Ripple from './pages/Ripple';
import FossilRecord from './pages/FossilRecord';
import Settings from './pages/Settings';
import Vulnerability from './pages/Vulnerability';
import Decisions from './pages/Decisions';
import Activity from './pages/Activity';
import Login from './pages/Login';

function AppRoutes() {
  const { isAuthenticated, login } = useAuth();
  const [showLogin, setShowLogin] = useState(!isAuthenticated);

  if (showLogin && !isAuthenticated) {
    return <Login onLogin={(token) => { login(token); setShowLogin(false); }} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/genome" element={<GenomeLab />} />
        <Route path="/dark-matter" element={<DarkMatter />} />
        <Route path="/immune" element={<ImmuneCenter />} />
        <Route path="/metabolic" element={<MetabolicRate />} />
        <Route path="/cognitive-load" element={<CognitiveLoad />} />
        <Route path="/ripple" element={<Ripple />} />
        <Route path="/fossil" element={<FossilRecord />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/vulnerability" element={<Vulnerability />} />
        <Route path="/decisions" element={<Decisions />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  );
}

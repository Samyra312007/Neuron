import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import Dashboard from './pages/Dashboard';
import GenomeLab from './pages/GenomeLab';
import DarkMatter from './pages/DarkMatter';
import ImmuneCenter from './pages/ImmuneCenter';
import MetabolicRate from './pages/MetabolicRate';
import CognitiveLoad from './pages/CognitiveLoad';
import Ripple from './pages/Ripple';
import FossilRecord from './pages/FossilRecord';

export default function App() {
  return (
    <ToastProvider>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}

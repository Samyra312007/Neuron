import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GenomeLab from './pages/GenomeLab';
import DarkMatter from './pages/DarkMatter';
import ImmuneCenter from './pages/ImmuneCenter';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/genome" element={<GenomeLab />} />
        <Route path="/dark-matter" element={<DarkMatter />} />
        <Route path="/immune" element={<ImmuneCenter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

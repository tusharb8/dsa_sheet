import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Layout from './Layout';
import Login from './pages/Login';
import Sheet from './pages/Sheet';
import TopicDetail from './pages/TopicDetail';
import Progress from './pages/Progress';
import Admin from './pages/Admin';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSelector((s: RootState) => s.auth);
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/sheet" element={<Protected><Sheet /></Protected>} />
      <Route path="/topic/:id" element={<Protected><TopicDetail /></Protected>} />
      <Route path="/progress" element={<Protected><Progress /></Protected>} />
      <Route path="/admin" element={<Protected><Admin /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

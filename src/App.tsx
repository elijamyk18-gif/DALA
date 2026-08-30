import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Discover } from './pages/Discover';
import { ProfileDetail } from './pages/ProfileDetail';
import { Onboarding } from './pages/Onboarding';
import { Messages } from './pages/Messages';
import { Events } from './pages/Events';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { About } from './pages/About';
import { Premium } from './pages/Premium';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { useMobileRedirect } from './hooks/useMobileRedirect';
import './App.css';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { session, user, profile, loading } = useAuth();
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-pulse text-2xl font-bold text-orange-500">Dala Loading...</div>
    </div>
  );
  
  if (!session) return <Navigate to="/login" />;

  // Admin check - either by role or hardcoded email (legacy/first admin)
  const isAdmin = profile?.role === 'admin' || user?.email === 'ofodo19@gmail.com';
  
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  useMobileRedirect();
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="profile/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
          <Route path="onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
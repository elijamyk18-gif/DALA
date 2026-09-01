import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { useMobileRedirect } from './hooks/useMobileRedirect';
import './App.css';

// Route-level code splitting: these pages load on demand instead of being
// bundled into the initial page load, keeping the first paint fast.
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })));
const FAQ = lazy(() => import('./pages/FAQ').then((m) => ({ default: m.FAQ })));
const Safety = lazy(() => import('./pages/Safety').then((m) => ({ default: m.Safety })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Discover = lazy(() => import('./pages/Discover').then((m) => ({ default: m.Discover })));
const ProfileDetail = lazy(() => import('./pages/ProfileDetail').then((m) => ({ default: m.ProfileDetail })));
const Onboarding = lazy(() => import('./pages/Onboarding').then((m) => ({ default: m.Onboarding })));
const Messages = lazy(() => import('./pages/Messages').then((m) => ({ default: m.Messages })));
const Events = lazy(() => import('./pages/Events').then((m) => ({ default: m.Events })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const Premium = lazy(() => import('./pages/Premium').then((m) => ({ default: m.Premium })));

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

function PageLoadingFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-pulse text-lg font-bold text-orange-400">Loading...</div>
    </div>
  );
}

function AppContent() {
  useMobileRedirect();
  return (
    <>
      <Toaster position="top-center" richColors />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="safety" element={<Safety />} />
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
      </Suspense>
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

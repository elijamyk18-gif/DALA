import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Search, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const pageTitles: Record<string, string> = {
  '/': 'Dala',
  '/login': 'Welcome',
  '/discover': 'Discover',
  '/events': 'Events',
  '/messages': 'Messages',
  '/profile': 'Profile',
  '/premium': 'Premium',
  '/onboarding': 'Setup',
  '/dashboard': 'Dashboard',
  '/admin': 'Admin',
};

export function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'Dala';

  const showBack = location.pathname !== '/' && location.pathname !== '/login';

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 md:hidden safe-area-top">
      <div className="flex items-center gap-2 min-w-0">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-100 text-slate-700 active:scale-90 transition-all hover:bg-slate-200"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : null}
        <motion.h1
          key={title}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold tracking-tight text-slate-900 truncate"
        >
          {title}
        </motion.h1>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/premium')}
          className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-400 text-white active:scale-90 transition-all hover:shadow-lg hover:shadow-orange-200/50"
          aria-label="Upgrade to Premium"
        >
          <Crown className="h-4 w-4" />
        </button>
        <button
          onClick={() => navigate('/discover')}
          className="flex items-center justify-center h-9 w-9 rounded-xl text-slate-500 active:scale-90 transition-all hover:bg-slate-100"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
        {session && (
          <button
            className="flex items-center justify-center h-9 w-9 rounded-xl text-slate-500 active:scale-90 transition-all hover:bg-slate-100 relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
        )}
      </div>
    </header>
  );
}
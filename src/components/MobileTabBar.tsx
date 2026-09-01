import { Link, useLocation } from 'react-router-dom';
import { House, Compass, CalendarDays, MessageCircle, CircleUser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function MobileTabBar() {
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { href: '/', label: 'Home', icon: House },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/events', label: 'Events', icon: CalendarDays },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
    { href: user ? `/profile/${user.id}` : '/login', label: 'Profile', icon: CircleUser },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around pb-safe bg-white/80 backdrop-blur-xl border-t border-slate-200/60 md:hidden shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.href;
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              'relative flex flex-col items-center justify-center py-2 px-3 min-w-[56px] transition-all active:scale-90',
              isActive ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute -top-px left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon className={cn('h-5 w-5 mb-0.5 transition-transform', isActive && 'scale-110')} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

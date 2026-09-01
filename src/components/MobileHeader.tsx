import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Search, Crown, Menu, LogOut, ShieldCheck, ArrowLeftRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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
  const { session, user, profile, signOut } = useAuth();

  const isAdmin = profile?.role === 'admin';
  const onAdminPage = location.pathname.startsWith('/admin');

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'Dala';

  const showBack = location.pathname !== '/' && location.pathname !== '/login';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

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
        {session && (
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex items-center justify-center h-9 w-9 rounded-xl text-slate-500 active:scale-90 transition-all hover:bg-slate-100"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] p-6 bg-white opacity-100 shadow-2xl">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="flex items-center gap-3">
                  <UserAvatar profile={profile} className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {profile?.display_name || 'My Account'}
                    </p>
                    <p className="text-xs font-normal text-slate-400 truncate">{user?.email}</p>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <SheetClose asChild>
                    {onAdminPage ? (
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={() => navigate(`/profile/${user?.id}`)}
                      >
                        <ArrowLeftRight className="mr-3 h-5 w-5" />
                        Back to Main Site
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-12 justify-start rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => navigate('/admin')}
                      >
                        <ShieldCheck className="mr-3 h-5 w-5" />
                        Admin Dashboard
                      </Button>
                    )}
                  </SheetClose>
                )}

                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start rounded-xl text-slate-600"
                    onClick={() => navigate(`/profile/${user?.id}`)}
                  >
                    <User className="mr-3 h-5 w-5" />
                    My Profile
                  </Button>
                </SheetClose>

                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start rounded-xl text-slate-600"
                    onClick={() => navigate('/premium')}
                  >
                    <Crown className="mr-3 h-5 w-5 text-orange-500" />
                    {profile?.is_premium ? 'Premium Active' : 'Upgrade to Premium'}
                  </Button>
                </SheetClose>

                <div className="my-2 h-px bg-slate-100" />

                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-start rounded-xl border-red-200 text-red-500 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign Out
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}

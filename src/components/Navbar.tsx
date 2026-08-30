import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Calendar, Compass, LogOut, Crown, Zap, ShieldCheck, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '@/components/UserAvatar';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { session, user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const isAdmin = profile?.role === 'admin' || user?.email === 'ofodo19@gmail.com';

  const links = [
    { href: '/', label: 'Home', icon: Heart },
    { href: '/about', label: 'About', icon: Heart },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/messages', label: 'Messages', icon: MessageCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
    setIsOpen(false);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-[100] w-full border-b bg-white/80 backdrop-blur-md hidden md:block">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 shadow-md">
            <Heart className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">Dala</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-orange-500',
                isActive(link.href) ? 'text-orange-600' : 'text-slate-600'
              )}
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </Link>
          ))}
          <div className="h-6 w-[1px] bg-slate-200" />
          {session ? (
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                    Admin
                  </Button>
                </Link>
              )}
              {profile?.is_premium ? (
                <Link to="/premium">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200 text-xs font-bold">
                    <Crown className="h-3 w-3" />
                    <span>PREMIUM</span>
                  </div>
                </Link>
              ) : (
                <Link to="/premium">
                  <Button variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50 group transition-all">
                    <Zap className="mr-2 h-3 w-3 fill-orange-500 text-orange-500 group-hover:scale-110" />
                    Upgrade
                  </Button>
                </Link>
              )}
              
              <Link to={`/profile/${user?.id}`}>
                <Button variant="sunrise" size="sm" className="shadow-sm pl-1 pr-4">
                  <UserAvatar profile={profile} className="h-7 w-7 mr-2 border-none" />
                  My Profile
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="sunrise" size="sm">Sign In</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button 
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition-colors hover:bg-slate-200 md:hidden" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-screen w-[280px] bg-white p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 shadow-md">
                    <Heart className="h-5 w-5 text-white" fill="currentColor" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">Dala</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-slate-100">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-col space-y-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center space-x-4 rounded-xl px-4 py-3 text-base font-bold transition-all',
                      isActive(link.href) ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                ))}
                
                <div className="my-4 h-px bg-slate-100" />

                {session ? (
                  <div className="space-y-4">
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <div className="flex items-center space-x-4 rounded-xl px-4 py-3 text-base font-bold text-blue-600 hover:bg-blue-50">
                          <ShieldCheck className="h-5 w-5" />
                          <span>Admin Dashboard</span>
                        </div>
                      </Link>
                    )}
                    
                    <Link to="/premium" onClick={() => setIsOpen(false)}>
                      <div className={cn(
                        "flex items-center space-x-4 rounded-xl px-4 py-3 text-base font-bold",
                        profile?.is_premium ? "bg-orange-50 text-orange-600" : "text-slate-600 hover:bg-slate-50"
                      )}>
                        {profile?.is_premium ? (
                          <><Crown className="h-5 w-5 text-orange-500" /> <span>Premium Active</span></>
                        ) : (
                          <><Zap className="h-5 w-5 text-orange-500" /> <span>Upgrade to Premium</span></>
                        )}
                      </div>
                    </Link>
                    
                    <Link to={`/profile/${user?.id}`} onClick={() => setIsOpen(false)}>
                      <Button variant="sunrise" className="w-full h-12 rounded-xl text-lg font-bold pl-2">
                        <UserAvatar profile={profile} className="h-8 w-8 mr-3" />
                        My Profile
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full h-12 rounded-xl text-slate-500" onClick={handleSignOut}>
                      <LogOut className="mr-2 h-5 w-5" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="sunrise" className="w-full h-12 rounded-xl text-lg font-bold">Sign In</Button>
                  </Link>
                )}
              </div>

              <div className="absolute bottom-8 left-6 right-6">
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  &copy; {new Date().getFullYear()} Dala Platforms
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
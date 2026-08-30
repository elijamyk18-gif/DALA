import { MessageCircle, ShieldCheck, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingChatButton() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);

  // Don't show on messages page or login or admin dashboard or if the user IS an admin
  const hideOnPages = ['/messages', '/login', '/admin'];
  const isAdmin = profile?.role === 'admin' || user?.email === 'ofodo19@gmail.com';
  
  if (hideOnPages.some(path => location.pathname.startsWith(path)) || isAdmin) {
    return null;
  }

  const handleContactAdmin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const adminEmail = 'ofodo19@gmail.com';
      const { data: adminProfile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_email', adminEmail)
        .single();

      if (error || !adminProfile) {
        // Fallback: search for any user with admin role if specific email fails
        const { data: anyAdmin } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single();
        
        if (anyAdmin) {
          navigate('/messages', { state: { recipientId: anyAdmin.id } });
        } else {
          navigate('/messages');
        }
      } else {
        navigate('/messages', { state: { recipientId: adminProfile.id } });
      }
    } catch (err) {
      navigate('/messages');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 w-64"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 flex items-center">
                <ShieldCheck className="h-4 w-4 text-blue-500 mr-1.5" />
                Need help?
              </h4>
              <button onClick={() => setShowTooltip(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our support team is here for you. Chat with an admin directly for any inquiries.
            </p>
            <Button 
              onClick={handleContactAdmin} 
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-xs h-8 text-white"
            >
              Start Chatting
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setShowTooltip(true)}
        onClick={handleContactAdmin}
        className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-blue-200 flex items-center justify-center group relative"
      >
        <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
      </motion.button>
    </div>
  );
}
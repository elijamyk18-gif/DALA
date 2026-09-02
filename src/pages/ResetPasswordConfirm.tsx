import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSEO } from '@/hooks/useSEO';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function getErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  const e = err as { message?: string; error_description?: string };
  const msg = e.message || e.error_description;
  if (msg && msg.trim() && msg.trim() !== '{}') return msg;
  return fallback;
}

export function ResetPasswordConfirm() {
  useSEO({
    title: 'Set a New Password | DALA',
    canonicalPath: '/reset-password',
  });

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { clearPasswordRecovery } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated!');
      clearPasswordRecovery();
      navigate('/onboarding');
    } catch (err: any) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Could not update your password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-gradient-to-b from-slate-50 via-white to-orange-50/30 px-4 md:min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-slate-200/50 overflow-hidden p-6"
      >
        <div className="flex flex-col items-center text-center gap-2 pb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-2">Set a new password</h1>
          <p className="text-sm text-slate-500 max-w-[280px]">
            You're verified! Choose a new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-12 rounded-2xl bg-slate-100/80 border-2 border-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="relative w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-200/50 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

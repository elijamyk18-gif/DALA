import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSEO } from '@/hooks/useSEO';
import { Heart, Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type AuthMode = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset';

// Supabase (and network) errors can arrive in several shapes depending on
// what failed. This pulls out a human-readable message from whichever
// shape we get, instead of ever showing a raw object like "{}".
function getErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  const e = err as { message?: string; error_description?: string; msg?: string; error?: string };
  const msg = e.message || e.error_description || e.msg || e.error;
  if (msg && typeof msg === 'string' && msg.trim() && msg.trim() !== '{}') {
    return msg;
  }
  return fallback;
}

export function Login() {
  useSEO({
    title: 'Sign In or Create an Account | DALA',
    description: 'Sign in to DALA or create a free account to start connecting, matching, and building meaningful relationships in your community.',
    canonicalPath: '/login',
  });
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const goAfterLogin = () => {
    // Everyone lands on the main site after signing in - admins included.
    // Admins can switch into the Admin Dashboard from the menu when they want it.
    navigate('/onboarding');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('We sent a 6-digit code to your email!');
        setCode('');
        setMode('verify');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        goAfterLogin();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Authentication error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      toast.error('Enter the 6-digit code from your email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'signup',
      });
      if (error) throw error;
      toast.success('Email confirmed! Welcome to DALA.');
      goAfterLogin();
    } catch (err: any) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Invalid or expired code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignupCode = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      toast.success('New code sent!');
    } catch (err: any) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Could not resend code'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Enter your email address');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('We sent a 6-digit code to your email!');
      setCode('');
      setNewPassword('');
      setMode('reset');
    } catch (err: any) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Could not send reset code'));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 6) {
      toast.error('Enter the 6-digit code from your email');
      return;
    }
    if (newPassword.trim().length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: 'recovery',
      });
      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      toast.success('Password updated! You can now sign in.');
      setPassword('');
      setNewPassword('');
      setCode('');
      setMode('signin');
    } catch (err: any) {
      console.error(err);
      toast.error(getErrorMessage(err, 'Invalid or expired code'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-gradient-to-b from-slate-50 via-white to-orange-50/30 md:min-h-[80vh] md:items-center md:justify-center">
      {/* Brand Hero */}
      <div className="relative flex flex-col items-center pt-12 pb-8 md:pt-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-orange-400 via-rose-400 to-pink-500 shadow-xl shadow-orange-200/50 rotate-12">
            <Heart className="h-10 w-10 text-white" fill="currentColor" />
          </div>
          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-300/30 blur-xl" />
          <div className="absolute -bottom-2 -left-2 h-6 w-6 rounded-full bg-rose-300/30 blur-lg" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900"
        >
          Dala
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-1 text-sm text-slate-500"
        >
          Connecting through shared life journeys
        </motion.p>
      </div>

      {/* Auth Card */}
      <div className="mx-4 flex-1 md:flex-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl shadow-slate-200/50 overflow-hidden md:mx-auto"
        >
          {/* Segmented Tab Switcher - only for signin/signup */}
          {(mode === 'signin' || mode === 'signup') && (
            <div className="flex p-2 gap-1 bg-slate-100/80 mx-4 mt-4 rounded-2xl">
              {(['signin', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setMode(tab); setShowPassword(false); }}
                  className={`relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    mode === tab ? 'text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode === tab && (
                    <motion.div
                      layoutId="auth-tab-bg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {tab === 'signin' ? 'Sign In' : 'Create Account'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Back button for sub-flows */}
          {(mode === 'verify' || mode === 'forgot' || mode === 'reset') && (
            <div className="px-4 pt-4">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </button>
            </div>
          )}

          {/* SIGN IN / SIGN UP FORM */}
          {(mode === 'signin' || mode === 'signup') && (
            <form onSubmit={handleAuth} className="p-4 pt-4 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100/80 border-2 border-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all ring-0"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-11 pr-12 rounded-2xl bg-slate-100/80 border-2 border-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all ring-0"
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

                  {mode === 'signin' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setCode(''); }}
                        className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-200/50 active:scale-[0.98] transition-all hover:shadow-xl hover:shadow-orange-200/60 disabled:opacity-60 overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>

              {/* Social Quick Options */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/80 px-4 text-slate-400 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 h-11 rounded-2xl border-2 border-slate-200 bg-white/60 text-slate-700 font-bold text-sm active:scale-[0.98] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex-1 h-11 rounded-2xl border-2 border-slate-200 bg-white/60 text-slate-700 font-bold text-sm active:scale-[0.98] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#333">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Apple
                </button>
              </div>

              <div className="px-1 pt-1 text-center">
                <p className="text-xs text-slate-400">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" className="text-orange-500 font-semibold underline underline-offset-2">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-orange-500 font-semibold underline underline-offset-2">Privacy Policy</Link>
                </p>
              </div>
            </form>
          )}

          {/* VERIFY SIGNUP CODE */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifySignup} className="p-4 pt-6 pb-6 space-y-4">
              <div className="flex flex-col items-center text-center gap-2 pb-2">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-2">Check your email</h2>
                <p className="text-sm text-slate-500 max-w-[280px]">
                  We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-2xl bg-slate-100/80 border-2 border-transparent text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
              />

              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-200/50 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={handleResendSignupCode}
                disabled={loading}
                className="w-full text-center text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors py-1"
              >
                Didn't get a code? Resend
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD - request code */}
          {mode === 'forgot' && (
            <form onSubmit={handleSendResetCode} className="p-4 pt-6 pb-6 space-y-4">
              <div className="flex flex-col items-center text-center gap-2 pb-2">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-2">Reset your password</h2>
                <p className="text-sm text-slate-500 max-w-[280px]">
                  Enter your email and we'll send you a code to reset your password
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100/80 border-2 border-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-orange-200/50 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {/* RESET PASSWORD - enter code + new password */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="p-4 pt-6 pb-6 space-y-4">
              <div className="flex flex-col items-center text-center gap-2 pb-2">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-2">Enter your code</h2>
                <p className="text-sm text-slate-500 max-w-[280px]">
                  Sent to <span className="font-semibold text-slate-700">{email}</span>
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full h-14 text-center text-2xl tracking-[0.5em] font-bold rounded-2xl bg-slate-100/80 border-2 border-transparent text-slate-900 placeholder:text-slate-300 focus:border-orange-400 focus:bg-white focus:outline-none transition-all"
              />

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
          )}
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Zap, Crown, Smartphone, Mail, Wallet, Clock, Copy, CopyCheck, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MPESA_LOGO = "https://storage.googleapis.com/dala-prod-public-storage/generated-images/17eb15e3-de4d-4d8e-b1c1-84159000da4a/mpesa-logo-retry-01096a89-1774985229452.webp";
const PAYPAL_LOGO = "https://storage.googleapis.com/dala-prod-public-storage/generated-images/17eb15e3-de4d-4d8e-b1c1-84159000da4a/paypal-logo-b7812c39-1774985162348.webp";
const BINANCE_LOGO = "https://storage.googleapis.com/dala-prod-public-storage/generated-images/17eb15e3-de4d-4d8e-b1c1-84159000da4a/binance-logo-0668bb97-1774985207425.webp";

export function Premium() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [modalCopyField, setModalCopyField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleModalCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setModalCopyField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setModalCopyField(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleRequestPremium = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: 'pending' })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Your premium request has been sent! An admin will review and approve it shortly.');
    } catch (error: any) {
      toast.error('Failed to send request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Unlimited private messaging",
    "View who liked your profile",
    "Priority in discovery results",
    "Ad-free experience",
    "Premium badge on profile",
    "Exclusive community events"
  ];

  if (profile?.is_premium) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 p-12 text-white shadow-2xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">You are a Premium Member!</h1>
          <p className="mb-8 text-xl text-orange-50">Thank you for supporting DALA. All premium features are now unlocked for you.</p>
          <Button 
            variant="outline" 
            className="bg-white text-orange-600 hover:bg-orange-50 border-none px-8 py-6 h-auto text-lg font-bold"
            onClick={() => navigate('/messages')}
          >
            Start Messaging
          </Button>
        </motion.div>
      </div>
    );
  }

  if (profile?.subscription_status === 'pending') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-slate-100 p-12 text-slate-900 shadow-2xl border border-slate-200"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 backdrop-blur-sm">
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="mb-4 text-4xl font-bold">Request Pending Approval</h1>
          <p className="mb-8 text-xl text-slate-600">We've received your request for DALA Premium. An admin is currently reviewing your payment. This typically takes a few minutes.</p>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 h-auto text-lg font-bold rounded-2xl"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 italic tracking-tight">
          Upgrade to <span className="text-orange-600">Premium</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Unlock the full DALA experience and connect with your community without limits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Benefits Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Why go Premium?</h2>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start space-x-3">
                  <div className="mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center space-x-4 p-6 bg-orange-50 rounded-2xl border border-orange-100">
            <ShieldCheck className="h-10 w-10 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-orange-900">Manual Approval</p>
              <p className="text-sm text-orange-700">Admins will verify your payment and upgrade your account.</p>
            </div>
          </div>
        </div>

        {/* Payment Options Column */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Select Payment Method</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* M-PESA */}
            <Card
              className="hover:border-orange-500 transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => setSelectedMethod('mpesa')}
            >
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className="h-12 w-12 rounded-lg overflow-hidden border bg-white flex items-center justify-center p-1">
                  <img src={MPESA_LOGO} alt="M-PESA" className="object-contain h-full w-full" />
                </div>
                <div>
                  <CardTitle className="text-lg">M-PESA</CardTitle>
                  <CardDescription>Direct Pay</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-2 text-slate-600 text-sm mb-4">
                  <Smartphone className="h-4 w-4" />
                  <span>+254 113 488 306</span>
                </div>
                <p className="text-xs text-slate-400">Please send payment to this number and click confirm below.</p>
              </CardContent>
            </Card>

            {/* PayPal */}
            <Card
              className="hover:border-orange-500 transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => setSelectedMethod('paypal')}
            >
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className="h-12 w-12 rounded-lg overflow-hidden border bg-white flex items-center justify-center p-2">
                  <img src={PAYPAL_LOGO} alt="PayPal" className="object-contain h-full w-full" />
                </div>
                <div>
                  <CardTitle className="text-lg">PayPal</CardTitle>
                  <CardDescription>International</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-2 text-slate-600 text-sm mb-4">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">carasunbrany@gmail.com</span>
                </div>
                <p className="text-xs text-slate-400">Send payment to the email above and click confirm.</p>
              </CardContent>
            </Card>

            {/* Binance */}
            <Card
              className="hover:border-orange-500 transition-all cursor-pointer group relative overflow-hidden md:col-span-2"
              onClick={() => setSelectedMethod('binance')}
            >
              <CardHeader className="flex flex-row items-center space-x-4">
                <div className="h-12 w-12 rounded-lg overflow-hidden border bg-white flex items-center justify-center p-2">
                  <img src={BINANCE_LOGO} alt="Binance" className="object-contain h-full w-full" />
                </div>
                <div>
                  <CardTitle className="text-lg">Binance Pay</CardTitle>
                  <CardDescription>Crypto Payment</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-2 text-slate-600 text-sm mb-4">
                  <Wallet className="h-4 w-4" />
                  <span>Scan QR or use DALA ID in Binance App</span>
                </div>
                <p className="text-xs text-slate-400">Fast, secure crypto transaction for worldwide users.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-slate-500 uppercase font-bold tracking-widest">Pricing Plan</p>
                <p className="text-3xl font-extrabold text-slate-900">Premium Plan</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-orange-600">$10</p>
                <p className="text-xs text-slate-400">/month</p>
              </div>
            </div>

            <Button 
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90 shadow-xl shadow-orange-200 transition-all active:scale-[0.98]"
              onClick={handleRequestPremium}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Sending Request...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-6 w-6 fill-current" />
                  <span>Request Premium Activation</span>
                </div>
              )}
            </Button>
            <p className="mt-4 text-center text-xs text-slate-400">
              By clicking, you confirm that you have sent the payment. Activation requires manual admin verification.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Payment Procedure Modal */}
    <Dialog open={selectedMethod !== null} onOpenChange={(open) => { if (!open) setSelectedMethod(null); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {selectedMethod === 'mpesa' ? 'M-PESA Payment Procedure' : selectedMethod === 'paypal' ? 'PayPal Payment Procedure' : 'Binance Pay Procedure'}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Follow these steps to complete your payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Send Payment */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">1</span>
              Send Payment
            </h3>
            <p className="text-sm text-slate-600 pl-8">
              {selectedMethod === 'mpesa' 
                ? 'Send <strong>$10</strong> via M-PESA to the number below using your M-PESA app.'
                : selectedMethod === 'paypal'
                ? 'Send <strong>$10</strong> via PayPal to the email address below.'
                : 'Send <strong>$10</strong> via Binance Pay using the DALA ID below.'}
            </p>
            <div className="ml-8 flex items-center justify-between bg-slate-50 rounded-xl border border-slate-200 p-3">
              <div className="flex items-center gap-2">
                {selectedMethod === 'mpesa' ? (
                  <Smartphone className="h-4 w-4 text-orange-500" />
                ) : selectedMethod === 'paypal' ? (
                  <Mail className="h-4 w-4 text-orange-500" />
                ) : (
                  <Wallet className="h-4 w-4 text-orange-500" />
                )}
                <span className="text-sm font-mono text-slate-700">
                  {selectedMethod === 'mpesa' ? '+254 113 488 306' : selectedMethod === 'paypal' ? 'carasunbrany@gmail.com' : 'DALA ID: dala_merchant'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleModalCopy(
                  selectedMethod === 'mpesa' ? '+254 113 488 306' : selectedMethod === 'paypal' ? 'carasunbrany@gmail.com' : 'dala_merchant',
                  selectedMethod === 'mpesa' ? 'M-PESA Number' : selectedMethod === 'paypal' ? 'PayPal Email' : 'DALA ID'
                )}
              >
                {modalCopyField === (selectedMethod === 'mpesa' ? 'M-PESA Number' : selectedMethod === 'paypal' ? 'PayPal Email' : 'DALA ID') ? (
                  <CopyCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-500" />
                )}
              </Button>
            </div>
          </div>

          {/* Step 2: Confirm Payment */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">2</span>
              Confirm Payment
            </h3>
            <p className="text-sm text-slate-600 pl-8">
              Take a screenshot of your payment confirmation and keep it for your records.
            </p>
          </div>

          {/* Step 3: Request Activation */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">3</span>
              Request Activation
            </h3>
            <p className="text-sm text-slate-600 pl-8">
              Click the "Request Activation" button below to notify the admin. Your account will be upgraded once payment is verified.
            </p>
          </div>

          {/* Admin Verification Notice */}
          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <ShieldCheck className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-900 text-sm">The Admin will Verify and then Upgrade You Instantly.</p>
              <p className="text-xs text-orange-700 mt-1">This process usually takes just a few minutes. Please be patient.</p>
            </div>
          </div>

          {/* Request Activation Button */}
          <Button
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90 shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
            onClick={handleRequestPremium}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Sending Request...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <ArrowRight className="h-5 w-5" />
                <span>Request Activation</span>
              </div>
            )}
          </Button>
        </div>

        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
    </>
  );
}
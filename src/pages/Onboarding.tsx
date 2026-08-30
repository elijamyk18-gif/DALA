import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, MapPin, Briefcase, Heart, Sparkles, Check, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Onboarding() {
  const { user, profile: existingProfile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    ethnicity: '',
    maritalStatus: '',
    children: '',
    education: '',
    occupation: '',
    about: '',
    seeking: [] as string[],
    preferredAgeMin: 18,
    preferredAgeMax: 80,
    preferredLocation: '',
    preferredReligion: '',
  });

  useEffect(() => {
    if (existingProfile) {
      setFormData({
        name: existingProfile.display_name || existingProfile.full_name || '',
        age: existingProfile.age?.toString() || '',
        gender: existingProfile.gender || '',
        location: existingProfile.location || '',
        ethnicity: existingProfile.ethnicity || '',
        maritalStatus: existingProfile.marital_status || '',
        children: existingProfile.has_children ? 'yes' : 'no',
        education: existingProfile.education || '',
        occupation: existingProfile.occupation || '',
        about: existingProfile.about_me || existingProfile.bio || '',
        seeking: existingProfile.seeking_types || [],
        preferredAgeMin: existingProfile.seeking_age_min || 18,
        preferredAgeMax: existingProfile.seeking_age_max || 80,
        preferredLocation: existingProfile.seeking_preferred_location || '',
        preferredReligion: '',
      });
    }
    setLoading(false);
  }, [existingProfile]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!user) {
        toast.error('Sign in required');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: formData.name,
          full_name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          location: formData.location,
          ethnicity: formData.ethnicity,
          marital_status: formData.maritalStatus,
          has_children: formData.children === 'yes',
          education: formData.education,
          occupation: formData.occupation,
          about_me: formData.about,
          bio: formData.about,
          seeking_types: formData.seeking,
          seeking_age_min: formData.preferredAgeMin,
          seeking_age_max: formData.preferredAgeMax,
          seeking_preferred_location: formData.preferredLocation,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile saved!');
      setTimeout(() => {
        navigate(`/profile/${user.id}`);
      }, 500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const steps = [
    { title: 'Basics', icon: User },
    { title: 'Lifestyle', icon: Briefcase },
    { title: 'Goal', icon: Heart },
    { title: 'Finish', icon: Sparkles },
  ];

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50">Loading...</div>;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <h2 className="text-lg font-black text-orange-600 uppercase tracking-widest">Dala Setup</h2>
      </div>

      <div className="mb-10 sm:mb-12 px-2">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10" />
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = step >= i + 1;
            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-300 ${
                    active ? 'bg-orange-600 text-white shadow-lg ring-4 ring-orange-100' : 'bg-white border border-slate-100 text-slate-300 shadow-sm'
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className={`mt-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${active ? 'text-orange-600' : 'text-slate-400'} hidden sm:block`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-none shadow-2xl sm:rounded-[2rem] overflow-hidden">
            {step === 1 && (
              <CardContent className="p-6 sm:p-8 space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl sm:text-2xl font-black">The Basics</CardTitle>
                  <CardDescription>Tell us who you are.</CardDescription>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input placeholder="Name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input type="number" placeholder="25" value={formData.age} onChange={(e) => updateField('age', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={formData.gender} onChange={(e) => updateField('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                    <Input className="pl-10 h-11 rounded-xl" placeholder="City, Country" value={formData.location} onChange={(e) => updateField('location', e.target.value)} />
                  </div>
                </div>
                <Button variant="sunrise" className="w-full h-12 text-lg rounded-xl mt-4 font-bold" onClick={nextStep}>Continue</Button>
              </CardContent>
            )}

            {step === 2 && (
              <CardContent className="p-6 sm:p-8 space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl sm:text-2xl font-black">Lifestyle</CardTitle>
                  <CardDescription>Background and daily life.</CardDescription>
                </CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={formData.maritalStatus} onChange={(e) => updateField('maritalStatus', e.target.value)}>
                      <option value="">Select</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Children</Label>
                    <select className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm" value={formData.children} onChange={(e) => updateField('children', e.target.value)}>
                      <option value="none">No children</option>
                      <option value="yes">Has children</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Occupation</Label>
                  <Input className="h-11 rounded-xl" placeholder="What do you do?" value={formData.occupation} onChange={(e) => updateField('occupation', e.target.value)} />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button variant="ghost" className="flex-1 h-12" onClick={prevStep}>Back</Button>
                  <Button variant="sunrise" className="flex-1 h-12 text-lg rounded-xl font-bold" onClick={nextStep}>Continue</Button>
                </div>
              </CardContent>
            )}

            {step === 3 && (
              <CardContent className="p-6 sm:p-8 space-y-4">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl sm:text-2xl font-black">Connection</CardTitle>
                  <CardDescription>What kind of belonging are you looking for?</CardDescription>
                </CardHeader>
                <div className="grid grid-cols-2 gap-2">
                  {['Father Figure', 'Mother Figure', 'Sibling', 'Mentor', 'Friend'].map((type) => (
                    <div
                      key={type}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 sm:p-4 transition-all ${
                        formData.seeking.includes(type) ? 'border-orange-500 bg-orange-50' : 'border-slate-50 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        const newSeeking = formData.seeking.includes(type)
                          ? formData.seeking.filter((t) => t !== type)
                          : [...formData.seeking, type];
                        updateField('seeking', newSeeking);
                      }}
                    >
                      <span className="text-xs sm:text-sm font-bold">{type}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Bio / About You</Label>
                  <Textarea className="min-h-[120px] rounded-xl" placeholder="Share your story..." value={formData.about} onChange={(e) => updateField('about', e.target.value)} />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button variant="ghost" className="flex-1 h-12" onClick={prevStep}>Back</Button>
                  <Button variant="sunrise" className="flex-1 h-12 text-lg rounded-xl font-bold" onClick={nextStep}>Final Step</Button>
                </div>
              </CardContent>
            )}

            {step === 4 && (
              <CardContent className="p-6 sm:p-8 space-y-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl sm:text-2xl font-black">Ready?</CardTitle>
                  <CardDescription>Review your details before finishing.</CardDescription>
                </CardHeader>
                <div className="rounded-2xl bg-orange-50 p-6 text-center">
                   <h4 className="text-xl font-black">{formData.name || 'Anonymous'}</h4>
                   <p className="text-sm text-slate-500">{formData.location || 'No location'}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" className="flex-1 h-12" onClick={prevStep}>Back</Button>
                  <Button variant="sunrise" className="flex-1 h-12 text-lg rounded-xl font-bold" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Finish Profile'}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
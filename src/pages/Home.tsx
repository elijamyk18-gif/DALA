import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Handshake, 
  Shield, 
  Megaphone, 
  ClipboardList, 
  ChevronRight,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfilePhoto } from '@/lib/utils';

export function Home() {
  const [featuredProfiles, setFeaturedProfiles] = useState<UserProfile[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeSurvey, setActiveSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyStep, setSurveyStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [profilesRes, eventsRes, annRes, surveyRes] = await Promise.all([
          supabase.from('profiles').select('*').limit(3),
          supabase.from('events').select('*').limit(2).order('date', { ascending: true }),
          supabase.from('announcements').select('*').limit(3).order('created_at', { ascending: false }),
          supabase.from('surveys').select('*').limit(1).order('created_at', { ascending: false })
        ]);

        if (profilesRes.data) setFeaturedProfiles(profilesRes.data as UserProfile[]);
        if (eventsRes.data) setUpcomingEvents(eventsRes.data);
        if (annRes.data) setAnnouncements(annRes.data);
        if (surveyRes.data && surveyRes.data.length > 0) {
          setActiveSurvey(surveyRes.data[0]);
          setShowSurvey(true);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSurveySubmit = async () => {
    try {
      const { error } = await supabase.from('survey_responses').insert([{
        survey_id: activeSurvey.id,
        responses: surveyAnswers,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);
      
      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      setShowSurvey(false);
    } catch (err: any) {
      toast.error('Could not submit survey: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col space-y-12 md:space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2000&auto=format&fit=crop"
            alt="Family gathered around dinner table"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent md:from-black/60 md:via-black/40" />
        </div>

        <div className="container relative mx-auto flex h-full flex-col justify-center px-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-4 md:space-y-6"
          >
            <div className="inline-flex items-center space-x-2 rounded-full bg-orange-500/20 px-4 py-1.5 text-xs font-bold text-orange-300 backdrop-blur-md border border-orange-500/30">
              <Sparkles className="h-4 w-4" />
              <span>Your Home Away From Home</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight md:text-7xl tracking-tight">
              Rewrite Your Story, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-rose-300">Thrive With Your Chosen Family</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-100/90 leading-relaxed font-medium max-w-lg">
              Dala connects hearts seeking authentic family-like bonds. Find your father figure, mother figure, sibling, or mentor.
            </p>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0 pt-4">
              <Link to="/onboarding" className="w-full sm:w-auto">
                <Button size="lg" className="sunrise w-full px-8 h-14 text-lg font-bold shadow-xl shadow-orange-900/20 rounded-2xl">
                  Find My Family
                </Button>
              </Link>
              <Link to="/discover" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/40 bg-white/10 px-8 h-14 text-lg font-bold backdrop-blur-md hover:bg-white/20 hover:text-white transition-all rounded-2xl"
                >
                  Explore Dala
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="container mx-auto px-4 -mt-16 md:-mt-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((ann, idx) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl shadow-slate-200/50"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Update</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{ann.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{ann.content}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Survey Modal/Overlay */}
      <AnimatePresence>
        {showSurvey && activeSurvey && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 left-4 right-4 md:bottom-8 md:right-8 md:left-auto z-[110] max-w-md"
          >
            <Card className="border-none shadow-2xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white overflow-hidden rounded-[2.5rem]">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => setShowSurvey(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{activeSurvey.title}</h3>
                <p className="text-blue-100 text-sm mb-8">{activeSurvey.description}</p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-blue-200">
                      <span>Question {surveyStep + 1} of {activeSurvey.questions.length}</span>
                      <span>{Math.round(((surveyStep + 1) / activeSurvey.questions.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${((surveyStep + 1) / activeSurvey.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="min-h-[80px] flex flex-col justify-center">
                    <h4 className="text-lg font-semibold leading-relaxed">
                      {activeSurvey.questions[surveyStep]}
                    </h4>
                  </div>
                  
                  <Input 
                    placeholder="Your answer..." 
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/50 h-12 focus-visible:ring-white rounded-xl"
                    value={surveyAnswers[surveyStep] || ''}
                    onChange={(e) => {
                      const newAnswers = [...surveyAnswers];
                      newAnswers[surveyStep] = e.target.value;
                      setSurveyAnswers(newAnswers);
                    }}
                  />
                  
                  <div className="flex gap-3 pt-4">
                    {surveyStep > 0 && (
                      <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 h-11 rounded-xl" onClick={() => setSurveyStep(s => s - 1)}>
                        Back
                      </Button>
                    )}
                    {surveyStep < activeSurvey.questions.length - 1 ? (
                      <Button className="flex-1 bg-white text-indigo-600 hover:bg-blue-50 font-bold h-11 rounded-xl" onClick={() => setSurveyStep(s => s + 1)}>
                        Next
                      </Button>
                    ) : (
                      <Button className="flex-1 bg-orange-500 text-white hover:bg-orange-600 font-bold border-none h-11 rounded-xl" onClick={handleSurveySubmit}>
                        Submit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Our Mission Section */}
      <section id="mission" className="container mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 items-center gap-10 md:gap-16 md:grid-cols-2">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center space-x-2 rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold text-orange-600">
              <Target className="h-4 w-4" />
              <span>Our Philosophy</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 md:text-5xl tracking-tight leading-tight">Authentic Belonging For Everyone</h2>
            <p className="text-base md:text-lg leading-relaxed text-slate-600 font-medium">
              We believe that biology is just one way to form a family. Dala empowers you to find the mentorship, guidance, and siblinghood you've been looking for. Our platform is a safe sanctuary for building bonds that last a lifetime.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="shrink-0 rounded-2xl bg-rose-100 p-3 text-rose-600 group-hover:scale-110 transition-transform">
                  <Handshake className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Radical Inclusion</h4>
                  <p className="text-xs text-slate-500 mt-1">Every heart is welcome here, regardless of background.</p>
                </div>
              </div>
              <div className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="shrink-0 rounded-2xl bg-orange-100 p-3 text-orange-600 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Safety First</h4>
                  <p className="text-xs text-slate-500 mt-1">Verified profiles and secure messaging for peace of mind.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] md:rounded-[3rem] bg-slate-100 shadow-2xl relative flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop" 
                alt="Community and family" 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 md:-left-8 md:translate-x-0 rounded-2xl md:rounded-[2rem] bg-white p-6 shadow-2xl md:p-10 border border-slate-100 w-[90%] md:w-auto">
              <div className="flex items-center space-x-4 md:space-x-5">
                <div className="flex -space-x-3 md:-space-x-4">
                  {[1,2,3,4].map(i => (
                    <Avatar key={i} className="h-10 w-10 md:h-12 md:w-12 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-slate-200 text-slate-400 font-black uppercase text-[10px]">D</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <p className="text-base md:text-lg font-extrabold text-slate-900 leading-none">2,450+ Members</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">Thriving Together</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="container mx-auto px-6">
        <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Meet the Community</h2>
            <p className="mt-2 text-base md:text-lg text-slate-500 font-medium">Discover people ready to welcome you.</p>
          </div>
          <Link to="/discover" className="w-full md:w-auto">
            <Button variant="outline" className="group h-12 w-full md:w-auto rounded-2xl px-6 font-bold border-slate-200 hover:bg-slate-50">
              Discover More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 md:h-96 animate-pulse rounded-[2rem] bg-slate-100" />
            ))}
          </div>
        ) : featuredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/60 border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="relative h-72 md:h-80 overflow-hidden bg-slate-50 flex items-center justify-center">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={getProfilePhoto(profile) || ''} />
                    <AvatarFallback className="bg-slate-50 text-slate-300 w-full h-full flex flex-col items-center justify-center p-8">
                       <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                         <span className="text-4xl font-black text-slate-200">{(profile.display_name || profile.full_name || 'U').charAt(0)}</span>
                       </div>
                       <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Photo Shared</span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <div className="text-white">
                       <h3 className="text-xl md:text-2xl font-bold">{profile.display_name}, {profile.age}</h3>
                       <p className="text-white/80 text-xs md:text-sm font-medium">{profile.location}</p>
                    </div>
                    <Link to={`/profile/${profile.id}`}>
                      <Button variant="sunrise" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl shadow-lg">
                        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.seeking_types?.slice(0, 2).map((type) => (
                      <span
                        key={type}
                        className="rounded-full bg-orange-50 px-2.5 py-1 text-[9px] md:text-[10px] font-bold text-orange-600 uppercase tracking-widest border border-orange-100"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="line-clamp-3 text-xs md:text-sm text-slate-600 italic leading-relaxed">"{profile.bio || profile.about_me || 'Ready to connect!'}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-orange-200 bg-orange-50/30 p-10 md:p-16 text-center">
            <Sparkles className="mx-auto h-12 w-12 md:h-16 md:w-16 text-orange-400 mb-6" />
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">Start the Dala Wave!</h3>
            <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto text-base md:text-lg">Join our growing community.</p>
            <Link to="/onboarding">
              <Button size="lg" className="sunrise h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl text-base md:text-lg font-bold">Create My Profile</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Why Section */}
      <section className="bg-slate-900 py-20 md:py-32 text-white overflow-hidden relative">
        <div className="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-orange-500/10 rounded-full blur-[100px] md:blur-[120px]"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Why Choose Dala?</h2>
            <p className="text-slate-400 text-base md:text-lg">We focus on soul-deep belonging and family bonds.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 group">
              <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 group-hover:bg-orange-500/20 group-hover:border-orange-500/30 transition-all duration-500 shadow-2xl">
                <Users className="h-8 w-8 md:h-10 md:w-10 text-orange-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold">Deep Kinship</h3>
              <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
                Connect with individuals looking for real family bonds.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 group">
              <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 group-hover:bg-rose-500/20 group-hover:border-rose-500/30 transition-all duration-500 shadow-2xl">
                <Heart className="h-8 w-8 md:h-10 md:w-10 text-rose-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold">Soul Mentorship</h3>
              <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
                Find guidance from elder figures who invest in you.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 group">
              <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all duration-500 shadow-2xl">
                <Calendar className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold">Real Moments</h3>
              <p className="text-slate-400 leading-relaxed text-sm md:text-base font-medium">
                Move beyond screens with community gatherings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container mx-auto px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Upcoming Gatherings</h2>
          <p className="text-base md:text-lg text-slate-500 font-medium">Real connection happens in person.</p>
        </div>
        
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ y: -8 }}
                className="flex flex-col overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white shadow-xl md:flex-row group border border-slate-100"
              >
                <div className="h-48 w-full md:h-auto md:w-2/5 relative">
                  <img src={event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop'} alt={event.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between p-6 md:p-10">
                  <div className="space-y-3">
                    <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">{event.title}</h3>
                    <div className="flex flex-col space-y-1.5">
                      <p className="flex items-center text-xs md:text-sm font-bold text-slate-500">
                        <Calendar className="mr-2 h-4 w-4 text-orange-500" />
                        {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Date TBD'}
                      </p>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xs md:text-sm line-clamp-2">{event.description}</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">{event.attendees_count || 0} joined</span>
                    <Link to="/events">
                      <Button variant="sunrise" className="px-5 h-10 font-bold rounded-xl">Join</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900">Quiet for now</h3>
            <Link to="/events" className="mt-6 inline-block">
              <Button variant="outline" className="border-orange-500 text-orange-600 h-11 px-6 rounded-xl font-bold">Events Center</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
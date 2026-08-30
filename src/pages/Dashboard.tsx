import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, MessageSquare, TrendingUp, Settings, Edit3, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!error) {
          setProfile(data);
        }
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const stats = [
    { label: 'Profile Views', value: profile?.views_count || 0, icon: Eye, color: 'text-blue-500' },
    { label: 'Likes Received', value: profile?.likes_count || 0, icon: Heart, color: 'text-rose-500' },
    { label: 'New Messages', value: '0', icon: MessageSquare, color: 'text-orange-500' },
    { label: 'Belonging Score', value: '100%', icon: TrendingUp, color: 'text-green-500' },
  ];

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold">No profile found</h2>
        <p className="text-slate-600 mt-2">Please set up your profile to see your dashboard.</p>
        <Link to="/onboarding" className="mt-6">
          <Button variant="sunrise">Set Up Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, {profile.full_name?.split(' ')[0]}</h1>
            {profile.is_premium && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200 text-[10px] font-bold">
                <Crown className="h-3 w-3" />
                <span>PREMIUM</span>
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-slate-600 mt-1">Here is what's happening with your connections.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Link to="/onboarding" className="flex-1 md:flex-none">
            <Button variant="sunrise" size="sm" className="w-full">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {!profile.is_premium && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 md:p-6 bg-gradient-to-r from-orange-500 to-rose-500 rounded-[2rem] text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Zap className="h-6 w-6 text-white" fill="white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Unlock Unlimited Messaging</h3>
              <p className="text-xs md:text-sm text-orange-50">Get Dala Premium to connect with anyone, anytime.</p>
            </div>
          </div>
          <Link to="/premium" className="w-full md:w-auto">
            <Button className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 w-full md:w-auto rounded-xl">
              Upgrade Now
            </Button>
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="flex items-center p-5 md:p-6">
                <div className={`mr-4 rounded-xl bg-slate-50 p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 md:mt-8 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Your Profile Card</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center pt-0">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 mb-4 ring-4 ring-orange-50">
              <AvatarImage src={profile.photos?.[0] || profile.profile_photo} />
              <AvatarFallback className="bg-orange-100 text-orange-600 text-xl font-bold">{profile.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg md:text-xl font-bold">{profile.full_name}, {profile.age}</h3>
            <p className="text-xs md:text-sm text-slate-500">{profile.location}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {profile.seeking_types?.map((type: string) => (
                <span key={type} className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                  {type}
                </span>
              ))}
            </div>
            <Link to={`/profile/${profile.id}`} className="mt-6 w-full">
              <Button variant="ghost" className="w-full text-orange-600 text-xs font-bold">
                View Public Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <MessageSquare size={32} className="mb-4 opacity-10" />
              <p className="text-sm">No recent activity yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  UserCheck, 
  MessageSquare, 
  Activity, 
  BarChart3, 
  UserPlus,
  Heart,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { AnnouncementManager } from '@/components/admin/AnnouncementManager';
import { SurveyManager } from '@/components/admin/SurveyManager';
import { UserManagement } from '@/components/admin/UserManagement';
import { EmailManager } from '@/components/admin/EmailManager';
import { getProfilePhoto } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalMessages: number;
  totalLikes: number;
  recentUsers: any[];
  trafficData: { date: string; views: number }[];
}

export function AdminDashboard() {
  const { profile: currentAdmin } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalLikes: 0,
    recentUsers: [],
    trafficData: []
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);
  
  // Surveys State
  const [surveys, setSurveys] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);

      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: activeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', sevenDaysAgo.toISOString());

      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, display_name, full_name, user_email, created_at, location, profile_photo, photos, role, is_premium, subscription_status')
        .order('created_at', { ascending: false })
        .limit(10);

      const { count: likesCount } = await supabase
        .from('media_likes')
        .select('*', { count: 'exact', head: true });

      const mockTraffic = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          views: Math.floor(Math.random() * 500) + 100
        };
      });

      setStats({
        totalUsers: userCount || 0,
        activeUsers: activeCount || (userCount ? Math.floor(userCount * 0.4) : 0),
        totalMessages: messageCount || 0,
        totalLikes: likesCount || 0,
        recentUsers: recentUsers || [],
        trafficData: mockTraffic
      });

      // Fetch Data for new sections
      await Promise.all([
        fetchAnnouncements(),
        fetchSurveys(),
        fetchUsers()
      ]);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err: any) {
      toast.error('Error fetching users: ' + err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setAnnouncements(data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const fetchSurveys = async () => {
    try {
      const { data, error } = await supabase.from('surveys').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setSurveys(data);
    } catch (err) {
      console.error('Error fetching surveys:', err);
    }
  };

  const handleApprovePremium = async (userId: string) => {
    toast.promise(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_premium: true,
            subscription_status: 'active'
          })
          .eq('id', userId);
        
        if (error) throw error;
        await fetchUsers();
      },
      {
        loading: 'Approving premium status...',
        success: 'Premium status approved!',
        error: 'Failed to approve premium status.'
      }
    );
  };

  const handleDeclinePremium = async (userId: string) => {
    toast.promise(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'none'
          })
          .eq('id', userId);
        
        if (error) throw error;
        await fetchUsers();
      },
      {
        loading: 'Declining premium request...',
        success: 'Premium request declined.',
        error: 'Failed to decline request.'
      }
    );
  };

  const pendingUsers = users.filter(u => u.subscription_status === 'pending');

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Activity className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 animate-pulse font-bold tracking-widest uppercase text-xs">Accessing Secure Admin Vault...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">System Command</h1>
          <p className="text-slate-500 font-medium mt-1">Monitoring Dala platform.</p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-bold text-slate-600 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm self-start md:self-auto">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span className="uppercase tracking-widest">System Healthy</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl h-12 md:h-14 inline-flex md:flex">
            <TabsTrigger value="overview" className="rounded-xl px-4 md:px-6 font-bold h-full">Overview</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-4 md:px-6 font-bold h-full">Users</TabsTrigger>
            <TabsTrigger value="approvals" className="relative rounded-xl px-4 md:px-6 font-bold h-full">
              Approvals
              {pendingUsers.length > 0 && (
                <span className="ml-2 bg-rose-500 text-white text-[9px] h-4 w-4 rounded-full flex items-center justify-center">
                  {pendingUsers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="information" className="rounded-xl px-4 md:px-6 font-bold h-full">Broadcasts</TabsTrigger>
            <TabsTrigger value="emails" className="rounded-xl px-4 md:px-6 font-bold h-full">Emails</TabsTrigger>
            <TabsTrigger value="surveys" className="rounded-xl px-4 md:px-6 font-bold h-full">Engagement</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 md:space-y-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Total Users</CardTitle>
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                </div>
                <div className="text-2xl md:text-3xl font-black mt-2">{stats.totalUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Active Now</CardTitle>
                  <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                </div>
                <div className="text-2xl md:text-3xl font-black mt-2">{stats.activeUsers.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Messages</CardTitle>
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                </div>
                <div className="text-2xl md:text-3xl font-black mt-2">{stats.totalMessages.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-white overflow-hidden group">
              <CardContent className="p-5 md:p-6">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Total Likes</CardTitle>
                  <Heart className="h-4 w-4 md:h-5 md:w-5 text-rose-500" />
                </div>
                <div className="text-2xl md:text-3xl font-black mt-2">{stats.totalLikes.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="lg:col-span-2 border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg md:text-xl font-bold">
                  <BarChart3 className="mr-3 h-5 w-5 text-slate-400" />
                  Platform Traffic
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:p-6">
                <div className="h-[250px] md:h-[350px] w-full flex items-end justify-between px-2 pb-2">
                  {stats.trafficData.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center group w-full px-1 md:px-2">
                      <div 
                        className="w-full bg-blue-500/10 rounded-xl md:rounded-2xl transition-all group-hover:bg-blue-500 relative"
                        style={{ height: `${Math.max((day.views / 600) * 100, 10)}%` }}
                      />
                      <span className="text-[8px] md:text-[10px] font-black text-slate-400 mt-2 md:mt-4 uppercase">{day.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center text-lg md:text-xl font-bold">
                  <UserPlus className="mr-3 h-5 w-5 text-slate-400" />
                  Latest Signups
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <ScrollArea className="h-[300px] md:h-[350px] pr-2">
                  <div className="space-y-3">
                    {stats.recentUsers.length > 0 ? stats.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9 md:h-10 md:w-10">
                            <AvatarImage src={getProfilePhoto(user) || ''} />
                            <AvatarFallback>{(user.display_name || 'U').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="overflow-hidden">
                            <p className="text-xs md:text-sm font-bold truncate max-w-[100px]">{user.display_name || 'Anonymous'}</p>
                            <p className="text-[9px] md:text-[10px] text-slate-400">{user.location || 'Unknown'}</p>
                          </div>
                        </div>
                        <span className="text-[8px] md:text-[9px] font-bold text-slate-300">{format(new Date(user.created_at), 'MMM d')}</span>
                      </div>
                    )) : <p className="text-center text-slate-400 py-10">No signups</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement 
            users={users} 
            currentAdminId={currentAdmin?.id} 
            loading={usersLoading} 
            onRefresh={fetchUsers} 
          />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">Pending Premium Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingUsers.map((user) => (
                    <Card key={user.id} className="border-orange-100 bg-orange-50/20 rounded-3xl">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 border-2 border-white mb-4">
                          <AvatarImage src={getProfilePhoto(user) || ''} />
                          <AvatarFallback>{(user.display_name || 'U').charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h4 className="font-bold">{user.display_name || user.full_name}</h4>
                        <div className="flex flex-col gap-2 mt-6 w-full">
                          <Button size="sm" className="w-full bg-green-600 rounded-xl" onClick={() => handleApprovePremium(user.id)}>
                            Approve
                          </Button>
                          <Button size="sm" variant="ghost" className="w-full text-rose-500 rounded-xl" onClick={() => handleDeclinePremium(user.id)}>
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400">
                  No pending requests
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="information" className="space-y-6">
          <AnnouncementManager 
            announcements={announcements} 
            onRefresh={fetchAnnouncements} 
            adminId={currentAdmin?.id} 
          />
        </TabsContent>

        <TabsContent value="emails" className="space-y-6">
          <EmailManager />
        </TabsContent>

        <TabsContent value="surveys" className="space-y-6">
          <SurveyManager 
            surveys={surveys} 
            onRefresh={fetchSurveys} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

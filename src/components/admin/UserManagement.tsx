import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Star, 
  UserX, 
  ShieldAlert, 
  ShieldCheck, 
  MapPin,
  Activity,
  User as UserIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getProfilePhoto } from '@/lib/utils';

interface UserManagementProps {
  users: any[];
  currentAdminId?: string;
  loading: boolean;
  onRefresh: () => void;
}

export function UserManagement({ users, currentAdminId, loading, onRefresh }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(u => 
    (u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.user_email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePromoteToAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'Promoting' : 'Revoking admin status';
    
    toast.promise(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
        
        if (error) throw error;
        onRefresh();
      },
      {
        loading: `${action}...`,
        success: `User role updated successfully!`,
        error: `Failed to update user role.`
      }
    );
  };

  const handleTogglePremium = async (userId: string, isPremium: boolean) => {
    const action = !isPremium ? 'Upgrading' : 'Downgrading';
    
    toast.promise(
      async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            is_premium: !isPremium,
            subscription_status: !isPremium ? 'active' : 'none'
          })
          .eq('id', userId);
        
        if (error) throw error;
        onRefresh();
      },
      {
        loading: `${action} user...`,
        success: `User premium status updated successfully!`,
        error: `Failed to update premium status.`
      }
    );
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <CardTitle className="flex items-center text-2xl font-bold text-slate-900">
              <Users className="mr-3 h-6 w-6 text-blue-500" />
              Community Members
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1">Manage permissions, roles and subscription statuses.</CardDescription>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-11 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                <th className="pb-4 pl-4 font-bold">User Information</th>
                <th className="pb-4 font-bold">Subscription</th>
                <th className="pb-4 font-bold">Location</th>
                <th className="pb-4 font-bold">Permissions</th>
                <th className="pb-4 text-right pr-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="space-y-4">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-slate-400">
                    <Activity className="h-10 w-10 mx-auto mb-4 animate-spin text-blue-500 opacity-20" />
                    <p className="font-medium">Loading members vault...</p>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-all rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100">
                    <td className="py-4 pl-4 bg-white rounded-l-2xl">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={getProfilePhoto(user) || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 font-bold">
                            {(user.display_name || user.full_name || 'U').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{user.display_name || user.full_name || 'Anonymous'}</span>
                            {user.is_premium && <Star className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">{user.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 bg-white">
                      <div className="flex flex-col">
                        {user.is_premium ? (
                          <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100 w-fit px-2 py-0.5 rounded-lg">
                            <Star className="h-3 w-3 mr-1.5" /> Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 border-slate-200 w-fit px-2 py-0.5 rounded-lg font-medium">
                            Standard
                          </Badge>
                        )}
                        {user.subscription_status === 'pending' && (
                          <span className="text-[9px] text-orange-600 font-bold uppercase mt-1.5 animate-pulse tracking-wider bg-orange-50 px-1.5 py-0.5 rounded w-fit">Upgrade Requested</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 bg-white">
                       <div className="flex items-center text-slate-500 font-medium">
                          <MapPin className="h-3.5 w-3.5 mr-2 text-slate-300" />
                          {user.location || 'Undisclosed'}
                        </div>
                    </td>
                    <td className="py-4 bg-white">
                      {user.role === 'admin' ? (
                        <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100 px-2 py-0.5 rounded-lg">
                          <ShieldCheck className="h-3 w-3 mr-1.5" /> Administrator
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-400 border-slate-200 px-2 py-0.5 rounded-lg font-medium">
                          Member
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 text-right pr-4 bg-white rounded-r-2xl">
                      {user.id !== currentAdminId && (
                        <div className="flex justify-end items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-9 px-3 rounded-xl transition-all ${user.is_premium ? "text-orange-600 hover:bg-orange-50" : "text-slate-600 hover:bg-slate-100"}`}
                            onClick={() => handleTogglePremium(user.id, user.is_premium || false)}
                          >
                            {user.is_premium ? (
                              <><UserX className="h-4 w-4 mr-2" /> Downgrade</>
                            ) : (
                              <><Star className="h-4 w-4 mr-2" /> Upgrade</>
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-9 px-3 rounded-xl transition-all ${user.role === 'admin' ? "text-rose-600 hover:bg-rose-50" : "text-blue-600 hover:bg-blue-50"}`}
                            onClick={() => handlePromoteToAdmin(user.id, user.role || 'user')}
                          >
                            {user.role === 'admin' ? (
                              <><ShieldAlert className="h-4 w-4 mr-2" /> Revoke</>
                            ) : (
                              <><ShieldCheck className="h-4 w-4 mr-2" /> Promote</>
                            )}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-slate-400">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10 opacity-10" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-600">No members found</h4>
                    <p className="text-sm mt-2">Try adjusting your search filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
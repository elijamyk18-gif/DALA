import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getProfilePhoto } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function Discover() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const types = ['All', 'Father Figure', 'Mother Figure', 'Sibling', 'Mentor', 'Friend'];

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      let query = supabase.from('profiles').select('*');
      
      if (selectedType !== 'All') {
        query = query.contains('seeking_types', [selectedType]);
      }
      
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (!error) {
        setProfiles(data || []);
      }
      setLoading(false);
    }

    const timeoutId = setTimeout(fetchProfiles, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedType]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Discover Connections</h1>
        <p className="mt-1 text-sm md:text-base text-slate-600">Find the person you've been looking for.</p>
      </header>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name or location..."
            className="pl-10 h-11 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 scrollbar-hide">
          <div className="flex shrink-0 items-center bg-slate-100 p-1 rounded-xl">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedType === type
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
          Searching for matches...
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center text-center text-slate-400">
          <p className="text-lg font-bold">No connections found</p>
          <p className="mt-1 text-sm">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 shadow-xl transition-all hover:shadow-2xl"
            >
              <div className="aspect-[3/4] overflow-hidden bg-slate-50 relative flex items-center justify-center">
                <Avatar className="h-full w-full rounded-none transition-transform duration-700 group-hover:scale-105">
                  <AvatarImage src={getProfilePhoto(profile) || ''} />
                  <AvatarFallback className="bg-slate-50 text-slate-300">
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                         <span className="text-4xl font-black text-slate-200">{(profile.full_name || 'U').charAt(0)}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">No Photo Shared</span>
                    </div>
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="mb-1">
                  <h3 className="text-xl font-bold">{profile.full_name}, {profile.age}</h3>
                </div>
                
                <div className="mb-4 flex items-center text-xs opacity-90">
                  <MapPin className="mr-1 h-3 w-3" />
                  {profile.location}
                </div>

                <div className="mt-4 flex space-x-2">
                  <Link to={`/profile/${profile.id}`} className="flex-1">
                    <Button variant="sunrise" size="sm" className="w-full h-10 rounded-xl font-bold">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
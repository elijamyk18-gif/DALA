import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Heart, Share2, Plus, CheckCircle2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

export function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) {
        setEvents(data || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSignUp = (title: string) => {
    toast.success(`You are signed up for ${title}!`);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newEvent.title || !newEvent.date || !newEvent.location) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('events').insert([{
        ...newEvent,
        creator_id: user.id,
        attendees_count: 1,
      }]);

      if (error) throw error;

      toast.success('Event created!');
      setIsCreateOpen(false);
      setNewEvent({ title: '', description: '', date: '', location: '', image_url: '' });
      fetchEvents();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 md:mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Gatherings</h1>
          <p className="mt-2 text-slate-600">Join community events designed for connection.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 h-12 rounded-2xl shadow-lg">
              <Plus className="mr-2 h-5 w-5" /> Host Event
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[500px] rounded-[2rem] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Organize a Gathering</DialogTitle>
              <DialogDescription className="text-sm">
                Share your event with the Dala community.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-3 sm:space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" placeholder="What's happening?" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time</Label>
                  <Input id="date" type="datetime-local" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="Nairobi, Kenya" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Tell people about it..." className="min-h-[100px]" value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} />
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                <Button type="button" variant="ghost" className="w-full sm:w-auto h-11" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" variant="sunrise" className="w-full sm:w-auto h-11" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Launch Event'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="group overflow-hidden flex flex-col h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-[2rem]">
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={event.image_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop'}
                  alt={event.title}
                  className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-black text-orange-600 shadow-sm backdrop-blur-md uppercase tracking-wider flex items-center">
                    <CheckCircle2 className="mr-1.5 h-3 w-3" />
                    Upcoming
                  </span>
                </div>
              </div>
              <CardHeader className="pb-2 px-6 pt-6">
                <CardTitle className="text-xl sm:text-2xl font-bold group-hover:text-orange-600 transition-colors line-clamp-1">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-xs font-bold text-slate-500">
                    <Calendar className="mr-2 h-4 w-4 text-orange-500" />
                    {event.date ? format(new Date(event.date), 'MMM d, p') : 'TBD'}
                  </div>
                  <div className="flex items-center text-xs font-bold text-slate-500">
                    <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                    {event.location}
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-3 pt-2">
                    {event.description}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center space-x-2 pt-4 border-t border-slate-50">
                  <Button className="flex-1 h-11 font-bold rounded-xl" variant="sunrise" onClick={() => handleSignUp(event.title)}>
                    Attend
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {events.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center px-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <Calendar className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold">No events found</h3>
              <Button variant="outline" className="mt-6 h-11 rounded-xl" onClick={() => setIsCreateOpen(true)}>Host the first event</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
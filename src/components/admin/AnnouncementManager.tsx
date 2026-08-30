import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Megaphone, 
  Trash2, 
  Save, 
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Announcement } from '@/types';

interface AnnouncementManagerProps {
  announcements: Announcement[];
  onRefresh: () => void;
  adminId?: string;
}

export function AnnouncementManager({ announcements, onRefresh, adminId }: AnnouncementManagerProps) {
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string[] | null>(null);

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error('Title and Content are required');
      return;
    }

    try {
      const { error } = await supabase.from('announcements').insert([{
        ...newAnnouncement,
        admin_id: adminId
      }]);
      
      if (error) throw error;
      
      toast.success('Announcement published successfully');
      setNewAnnouncement({ title: '', content: '' });
      onRefresh();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const confirmDelete = (ids: string[]) => {
    setItemToDelete(ids);
    setShowDeleteConfirm(true);
  };

  const handleDeleteAnnouncements = async () => {
    if (!itemToDelete || itemToDelete.length === 0) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('announcements').delete().in('id', itemToDelete);
      if (error) throw error;
      
      toast.success(`${itemToDelete.length} announcement(s) deleted successfully`);
      onRefresh();
      setSelectedAnnouncements([]);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error('Error deleting: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleAnnouncementSelection = (id: string) => {
    setSelectedAnnouncements(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllAnnouncements = () => {
    if (selectedAnnouncements.length === announcements.length) {
      setSelectedAnnouncements([]);
    } else {
      setSelectedAnnouncements(announcements.map(a => a.id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <Megaphone className="mr-2 h-5 w-5 text-blue-500" />
            New Announcement
          </CardTitle>
          <CardDescription>Post news, updates, or tips for all Dala users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Title</label>
            <Input 
              placeholder="e.g., Welcome to the new Dala!" 
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Content</label>
            <Textarea 
              placeholder="Write your announcement content here..." 
              className="min-h-[150px] bg-slate-50 border-slate-200 focus:bg-white transition-all"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md font-bold shadow-md" 
            onClick={handleCreateAnnouncement}
          >
            <Save className="mr-2 h-4 w-4" />
            Publish Announcement
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg overflow-hidden flex flex-col">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Recent Announcements</CardTitle>
              <CardDescription>Manage existing broadcasts</CardDescription>
            </div>
            {announcements.length > 0 && (
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 pr-3 border-r border-slate-100">
                  <Checkbox 
                    id="select-all-ann" 
                    checked={selectedAnnouncements.length === announcements.length && announcements.length > 0}
                    onCheckedChange={toggleAllAnnouncements}
                  />
                  <label htmlFor="select-all-ann" className="text-[10px] font-bold text-slate-500 cursor-pointer uppercase tracking-wider">
                    All
                  </label>
                </div>
                {selectedAnnouncements.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 text-[10px] px-3 font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-200"
                    onClick={() => confirmDelete(selectedAnnouncements)}
                  >
                    <Trash2 className="h-3 w-3 mr-1.5" />
                    Delete ({selectedAnnouncements.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-[500px]">
            <div className="p-6 space-y-4">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div 
                    key={ann.id} 
                    className={`p-5 rounded-2xl border transition-all duration-200 group ${
                      selectedAnnouncements.includes(ann.id) 
                        ? 'border-blue-200 bg-blue-50/40 shadow-sm' 
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          className="mt-1"
                          checked={selectedAnnouncements.includes(ann.id)}
                          onCheckedChange={() => toggleAnnouncementSelection(ann.id)}
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{ann.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            {format(new Date(ann.created_at), 'MMM d, yyyy \u00b7 HH:mm')}
                          </p>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl">
                          <DropdownMenuItem 
                            className="text-rose-600 focus:text-white focus:bg-rose-600 cursor-pointer font-medium m-1 rounded-lg"
                            onClick={() => confirmDelete([ann.id])}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Permanentely
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed ml-9 line-clamp-4">{ann.content}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Megaphone className="h-10 w-10 opacity-20" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-600">No Announcements Yet</h4>
                  <p className="text-sm max-w-[200px] text-center mt-2 opacity-60">Your messages to the community will appear here once published.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-rose-600" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 pb-4">
              This action cannot be undone. This will permanently delete {itemToDelete?.length || 1} announcement(s) from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="sm:flex-1 h-12 rounded-xl font-bold border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAnnouncements}
              className="sm:flex-1 h-12 rounded-xl font-bold bg-rose-600 hover:bg-rose-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
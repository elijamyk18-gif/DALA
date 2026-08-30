import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  Eye,
  ClipboardList,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

interface SurveyManagerProps {
  surveys: any[];
  onRefresh: () => void;
}

export function SurveyManager({ surveys, onRefresh }: SurveyManagerProps) {
  const [newSurvey, setNewSurvey] = useState({ title: '', description: '', questions: [''] });
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string[] | null>(null);

  const handleCreateSurvey = async () => {
    if (!newSurvey.title || !newSurvey.description || newSurvey.questions.filter(q => q.trim()).length === 0) {
      toast.error('Title, Description and at least one question are required');
      return;
    }

    try {
      const { error } = await supabase.from('surveys').insert([{
        title: newSurvey.title,
        description: newSurvey.description,
        questions: newSurvey.questions.filter(q => q.trim())
      }]);
      
      if (error) throw error;
      
      toast.success('Survey created successfully');
      setNewSurvey({ title: '', description: '', questions: [''] });
      onRefresh();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const confirmDelete = (ids: string[]) => {
    setItemToDelete(ids);
    setShowDeleteConfirm(true);
  };

  const handleDeleteSurveys = async () => {
    if (!itemToDelete || itemToDelete.length === 0) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('surveys').delete().in('id', itemToDelete);
      if (error) throw error;
      
      toast.success(`${itemToDelete.length} survey(s) deleted successfully`);
      onRefresh();
      setSelectedSurveys([]);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error('Error deleting: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const addQuestionField = () => {
    setNewSurvey(prev => ({ ...prev, questions: [...prev.questions, ''] }));
  };

  const updateQuestionField = (index: number, value: string) => {
    const updated = [...newSurvey.questions];
    updated[index] = value;
    setNewSurvey(prev => ({ ...prev, questions: updated }));
  };

  const toggleSurveySelection = (id: string) => {
    setSelectedSurveys(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAllSurveys = () => {
    if (selectedSurveys.length === surveys.length) {
      setSelectedSurveys([]);
    } else {
      setSelectedSurveys(surveys.map(s => s.id));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <ClipboardList className="mr-2 h-5 w-5 text-orange-500" />
            Create Satisfaction Survey
          </CardTitle>
          <CardDescription>Get feedback from your community to improve the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Survey Title</label>
            <Input 
              placeholder="e.g., App Experience Feedback" 
              className="bg-slate-50 border-slate-200"
              value={newSurvey.title}
              onChange={(e) => setNewSurvey(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <Textarea 
              placeholder="What is this survey about?" 
              className="bg-slate-50 border-slate-200"
              value={newSurvey.description}
              onChange={(e) => setNewSurvey(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="space-y-3 pt-2">
            <label className="text-sm font-semibold text-slate-700">Questions</label>
            {newSurvey.questions.map((q, idx) => (
              <div key={idx} className="flex gap-2 group">
                <Input 
                  placeholder={`Question ${idx + 1}`} 
                  className="bg-slate-50 border-slate-200"
                  value={q}
                  onChange={(e) => updateQuestionField(idx, e.target.value)}
                />
                {newSurvey.questions.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    onClick={() => {
                      const updated = newSurvey.questions.filter((_, i) => i !== idx);
                      setNewSurvey(prev => ({ ...prev, questions: updated }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2 w-full border-dashed border-2 hover:bg-slate-50 text-slate-500 border-slate-200 font-bold" onClick={addQuestionField}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
          <Button className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-md font-bold shadow-md mt-4" onClick={handleCreateSurvey}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Launch Survey
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg overflow-hidden flex flex-col">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Active Surveys</CardTitle>
              <CardDescription>Manage community engagement</CardDescription>
            </div>
            {surveys.length > 0 && (
              <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 pr-3 border-r border-slate-100">
                  <Checkbox 
                    id="select-all-sur" 
                    checked={selectedSurveys.length === surveys.length && surveys.length > 0}
                    onCheckedChange={toggleAllSurveys}
                  />
                  <label htmlFor="select-all-sur" className="text-[10px] font-bold text-slate-500 cursor-pointer uppercase tracking-wider">
                    All
                  </label>
                </div>
                {selectedSurveys.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 text-[10px] px-3 font-bold uppercase tracking-wider animate-in fade-in zoom-in duration-200"
                    onClick={() => confirmDelete(selectedSurveys)}
                  >
                    <Trash2 className="h-3 w-3 mr-1.5" />
                    Delete ({selectedSurveys.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-[500px]">
            <div className="p-6 space-y-4">
              {surveys.length > 0 ? (
                surveys.map((survey) => (
                  <div 
                    key={survey.id} 
                    className={`p-5 rounded-2xl border transition-all duration-200 ${
                      selectedSurveys.includes(survey.id) 
                        ? 'border-orange-200 bg-orange-50/20' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          className="mt-1"
                          checked={selectedSurveys.includes(survey.id)}
                          onCheckedChange={() => toggleSurveySelection(survey.id)}
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">{survey.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{survey.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 ml-4">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          {survey.questions?.length || 0} Qs
                        </span>
                        <span className="text-[9px] font-extrabold text-green-600 mt-2 uppercase tracking-widest border border-green-100 bg-green-50 px-1.5 py-0.5 rounded">Active</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6 ml-9">
                      <Button variant="outline" size="sm" className="h-9 text-xs flex-1 rounded-xl font-bold bg-slate-50/50 hover:bg-white">
                        <Eye className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> View Results
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
                          <DropdownMenuItem 
                            className="text-rose-600 focus:text-white focus:bg-rose-600 cursor-pointer font-medium m-1 rounded-lg"
                            onClick={() => confirmDelete([survey.id])}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Survey
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <ClipboardList className="h-10 w-10 opacity-20" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-600">No Active Surveys</h4>
                  <p className="text-sm max-w-[200px] text-center mt-2 opacity-60">Collect feedback from your members by creating your first survey.</p>
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
            <AlertDialogTitle className="text-center text-2xl font-bold">Delete Survey(s)?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 pb-4">
              This will permanently remove the survey and all collected responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="sm:flex-1 h-12 rounded-xl font-bold border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSurveys}
              className="sm:flex-1 h-12 rounded-xl font-bold bg-rose-600 hover:bg-rose-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
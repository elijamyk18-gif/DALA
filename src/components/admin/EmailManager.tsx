import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Send, Sparkles, Crown, Info, Megaphone, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Audience = 'all' | 'premium' | 'non_premium' | 'test';

const PRESETS: Record<string, { label: string; icon: any; subject: string; body: string }> = {
  promotion: {
    label: 'Promotion',
    icon: Sparkles,
    subject: 'A special offer just for you 🎉',
    body: 'Hi there,\n\nWe have something special for you! [Describe your promotion here]\n\nDon\'t miss out — this offer is available for a limited time.\n\nSee you on DALA!',
  },
  info: {
    label: 'Info / Update',
    icon: Info,
    subject: 'An update from DALA',
    body: 'Hi there,\n\nWe wanted to let you know about [describe the update here].\n\nThanks for being part of the DALA community!',
  },
  premium_reminder: {
    label: 'Premium Reminder',
    icon: Crown,
    subject: 'Unlock more with DALA Premium',
    body: 'Hi there,\n\nJust a friendly reminder that DALA Premium gives you [list premium benefits here].\n\nUpgrade anytime from your profile page!',
  },
  announcement: {
    label: 'Announcement',
    icon: Megaphone,
    subject: 'DALA Announcement',
    body: 'Hi there,\n\n[Write your announcement here]\n\nThanks,\nThe DALA Team',
  },
};

function wrapHtml(subject: string, plainBody: string): string {
  const safeBody = plainBody
    .split('\n')
    .map((line) => (line.trim() === '' ? '<br/>' : `<p style="margin:0 0 12px;">${line}</p>`))
    .join('');

  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 52px; height: 52px; border-radius: 16px; background: linear-gradient(135deg, #fb923c, #f43f5e); line-height: 52px; font-size: 24px;">🧡</div>
      <h1 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 14px 0 0;">DALA</h1>
    </div>
    <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">${subject}</h2>
    <div style="color: #334155; font-size: 15px; line-height: 1.7;">${safeBody}</div>
    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 32px 0 16px;" />
    <p style="color: #cbd5e1; font-size: 11px; text-align: center;">DALA · dala.home.kg</p>
  </div>`;
}

export function EmailManager() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>('all');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const applyPreset = (key: string) => {
    const preset = PRESETS[key];
    if (!preset) return;
    setSubject(preset.subject);
    setBody(preset.body);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    if (audience === 'test' && !testEmail.trim()) {
      toast.error('Enter a test email address');
      return;
    }

    setSending(true);
    try {
      const html = wrapHtml(subject, body);
      const { data, error } = await supabase.functions.invoke('send-admin-email', {
        body: {
          subject,
          html,
          audience,
          testEmail: audience === 'test' ? testEmail.trim() : undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(
        audience === 'test'
          ? `Test email sent to ${testEmail}`
          : `Email sent to ${data?.sentCount ?? 0} user(s)!`
      );
    } catch (err: any) {
      toast.error('Failed to send: ' + (err.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-900">
            <Mail className="mr-2 h-5 w-5 text-blue-500" />
            Send Email to Users
          </CardTitle>
          <CardDescription>
            Send promotions, updates, or reminders directly to users' inboxes via email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Presets */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Quick Templates</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRESETS).map(([key, preset]) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyPreset(key)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-orange-300 transition-all px-3 py-2.5 text-left"
                  >
                    <Icon className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-700">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Send To</label>
            <Select value={audience} onValueChange={(v) => setAudience(v as Audience)}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium Users Only</SelectItem>
                <SelectItem value="non_premium">Non-Premium Users Only</SelectItem>
                <SelectItem value="test">Just a Test Email (to myself)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {audience === 'test' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Test Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="bg-slate-50 border-slate-200"
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Subject</label>
            <Input
              placeholder="e.g., A special offer just for you"
              className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Message</label>
            <Textarea
              placeholder="Write your email content here..."
              className="min-h-[180px] bg-slate-50 border-slate-200 focus:bg-white transition-all"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-slate-400">Plain text is fine — line breaks become paragraphs automatically.</p>
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md font-bold shadow-md"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {audience === 'test' ? 'Send Test Email' : 'Send to Users'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg overflow-hidden flex flex-col">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-slate-900">Live Preview</CardTitle>
          <CardDescription>How the email will look to recipients</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex-1 bg-slate-100/50">
          {subject || body ? (
            <div
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
              dangerouslySetInnerHTML={{ __html: wrapHtml(subject || '(no subject)', body || '(no message yet)') }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Mail className="h-10 w-10 opacity-20 mb-4" />
              <p className="text-sm">Start typing to see a preview</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

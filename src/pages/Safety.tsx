import { useSEO } from '@/hooks/useSEO';
import { LegalPageLayout, Section } from '@/components/legal/LegalPageLayout';
import { ShieldCheck } from 'lucide-react';

export function Safety() {
  useSEO({
    title: 'Safety Guidelines | DALA',
    description: 'Tips for staying safe while connecting with others and meeting in person through DALA.',
    canonicalPath: '/safety',
  });

  return (
    <LegalPageLayout
      title="Safety Guidelines"
      subtitle="Your safety matters to us — please take a moment to read this."
    >
      <div className="flex items-center gap-3 rounded-2xl bg-orange-50 border border-orange-100 p-4 mb-2">
        <ShieldCheck className="h-8 w-8 text-orange-500 shrink-0" />
        <p className="text-sm text-slate-700">
          DALA helps you find real connections, but we can't verify everything about every user.
          These guidelines apply whether you're looking for a friend, a mentor, a father or mother
          figure, or a romantic partner.
        </p>
      </div>

      <Section title="Protecting your personal information">
        <ul className="list-disc pl-5 space-y-1">
          <li>Don't share your home address, workplace, financial details, or ID/passport numbers with someone you've just met.</li>
          <li>Keep conversations on DALA's messaging until you feel comfortable — you're not obligated to share your phone number or social media right away.</li>
          <li>Use a profile photo that doesn't reveal identifying details like your exact home or workplace in the background.</li>
        </ul>
      </Section>

      <Section title="Before you meet in person">
        <ul className="list-disc pl-5 space-y-1">
          <li>Get to know the person through messages (and ideally a video call) before meeting face-to-face.</li>
          <li>Tell a friend or family member who you're meeting, where, and when — and share the person's DALA profile with them.</li>
          <li>Set up your own transportation to and from the meeting; don't rely on the other person for a ride.</li>
        </ul>
      </Section>

      <Section title="Meeting in person">
        <ul className="list-disc pl-5 space-y-1">
          <li>Always meet in a public place for the first several meetings — a café, restaurant, or community event works well.</li>
          <li>Stay in public, populated areas, and avoid isolated locations.</li>
          <li>Keep your phone charged and easily accessible.</li>
          <li>Avoid alcohol or substances that could impair your judgment, especially early on.</li>
          <li>Trust your instincts — if something feels wrong, it's okay to leave.</li>
        </ul>
      </Section>

      <Section title="Watch out for common red flags">
        <p>Be cautious of anyone who:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Asks you for money, gift cards, or financial help, no matter how compelling the story.</li>
          <li>Pressures you to move off DALA and onto another app very quickly.</li>
          <li>Avoids video calls or phone calls, or their photos and story don't add up.</li>
          <li>Pushes for personal information, secrecy, or isolation from your friends and family.</li>
          <li>Rushes emotional intimacy or commitment unusually fast.</li>
        </ul>
        <p>
          These patterns can show up in any type of relationship sought on DALA — including
          mentorships and father/mother-figure connections — not just romantic ones. Genuine
          relationships don't require secrecy or urgency.
        </p>
      </Section>

      <Section title="DALA is for adults only">
        <p>
          DALA is only for users 18 and older. If you believe someone on DALA is misrepresenting
          their age, or if you're a minor and encountered DALA, please contact us immediately at{' '}
          <a href="mailto:carasunbrany@gmail.com" className="text-orange-500 font-semibold underline underline-offset-2">
            carasunbrany@gmail.com
          </a>.
        </p>
      </Section>

      <Section title="Reporting a concern">
        <p>
          If someone makes you uncomfortable, pressures you, or violates these guidelines, you can
          block them directly from their profile or a conversation. For anything that concerns
          your safety, please also email us so we can look into it. If you're ever in immediate
          danger, contact local emergency services first.
        </p>
      </Section>

      <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
        This page offers general safety tips and does not guarantee your safety. You are
        responsible for your own interactions and decisions when using DALA and meeting others.
      </p>
    </LegalPageLayout>
  );
}

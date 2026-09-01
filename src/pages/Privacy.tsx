import { useSEO } from '@/hooks/useSEO';
import { LegalPageLayout, Section } from '@/components/legal/LegalPageLayout';

export function Privacy() {
  useSEO({
    title: 'Privacy Policy | DALA',
    description: 'How DALA collects, uses, and protects your personal information.',
    canonicalPath: '/privacy',
  });

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="What we collect, why, and how it's protected."
      lastUpdated="September 2026"
    >
      <Section title="1. Information we collect">
        <p>When you use DALA, we collect:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account info:</strong> your email address and password (securely hashed — we never see or store your actual password).</li>
          <li><strong>Profile info:</strong> details you choose to share, such as your name, age, location, interests, bio, photos, and what you're looking for.</li>
          <li><strong>Messages:</strong> content you send to other users through DALA's messaging feature.</li>
          <li><strong>Usage data:</strong> basic activity like profile views, likes, and event RSVPs, used to operate core features.</li>
        </ul>
      </Section>

      <Section title="2. How we use your information">
        <ul className="list-disc pl-5 space-y-1">
          <li>To create and manage your account, and verify it's really you (via email confirmation codes).</li>
          <li>To show your profile to other users and power features like Discover and matching.</li>
          <li>To deliver messages between you and other users.</li>
          <li>To send you account-related emails: signup confirmation codes, password reset codes, and — occasionally — announcements, promotions, or reminders from our team (for example, a reminder to add a profile picture). You can contact us to opt out of non-essential emails at any time.</li>
          <li>To keep DALA safe, including investigating reports of abuse or Terms of Service violations.</li>
        </ul>
      </Section>

      <Section title="3. Who we share information with">
        <p>We don't sell your personal information. We do share limited data with the service providers that help us run DALA:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Supabase</strong> — our database and authentication provider, which securely stores your account and profile data.</li>
          <li><strong>SMTP2GO</strong> — our email delivery provider, used to send confirmation codes, password reset codes, and admin emails.</li>
        </ul>
        <p>
          Other DALA users can see the profile information you choose to make visible (like your
          name, photos, and bio), plus any messages you send them directly.
        </p>
      </Section>

      <Section title="4. Your choices and rights">
        <ul className="list-disc pl-5 space-y-1">
          <li>You can update or correct your profile information at any time from your account.</li>
          <li>You can request a copy of your data or ask us to delete your account and associated data by contacting us.</li>
          <li>You can control what appears on your public profile.</li>
        </ul>
      </Section>

      <Section title="5. Data retention">
        <p>
          We keep your information for as long as your account is active. If you delete your
          account, we'll remove your profile and personal data within a reasonable time, except
          where we're required to retain certain records by law or to resolve disputes.
        </p>
      </Section>

      <Section title="6. Data security">
        <p>
          We use industry-standard measures — including encrypted connections (HTTPS) and access
          controls on our database — to protect your information. No system is 100% secure,
          so we encourage you to use a strong, unique password and avoid sharing sensitive
          personal or financial information with other users.
        </p>
      </Section>

      <Section title="7. Children's privacy">
        <p>
          DALA is not intended for anyone under 18. We do not knowingly collect information from
          minors. If we learn that someone under 18 has created an account, we will remove it.
        </p>
      </Section>

      <Section title="8. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. If we make material changes,
          we'll notify you via email or an in-app notice.
        </p>
      </Section>

      <Section title="9. Contact us">
        <p>
          Questions about this policy or your data? Reach out at{' '}
          <a href="mailto:carasunbrany@gmail.com" className="text-orange-500 font-semibold underline underline-offset-2">
            carasunbrany@gmail.com
          </a>.
        </p>
      </Section>

      <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
        This document is a general template and does not constitute legal advice. Depending on
        where your users are located (for example, the EU or California), additional privacy
        laws like GDPR or CCPA may apply to you. We recommend having this policy reviewed by a
        qualified lawyer before relying on it.
      </p>
    </LegalPageLayout>
  );
}

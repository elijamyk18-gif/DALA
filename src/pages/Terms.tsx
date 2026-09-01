import { useSEO } from '@/hooks/useSEO';
import { LegalPageLayout, Section } from '@/components/legal/LegalPageLayout';

export function Terms() {
  useSEO({
    title: 'Terms of Service | DALA',
    description: 'The terms and conditions for using DALA to connect, match, and build meaningful relationships.',
    canonicalPath: '/terms',
  });

  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The rules for using DALA, in plain language."
      lastUpdated="September 2026"
    >
      <Section title="1. Welcome to DALA">
        <p>
          DALA ("we," "us," "our") operates a community platform that helps people connect,
          build meaningful relationships, and find chosen family — including friendships, mentors,
          father/mother figures, siblings, and romantic connections. By creating an account or
          using DALA in any way, you agree to these Terms of Service. If you don't agree, please
          don't use DALA.
        </p>
      </Section>

      <Section title="2. Who can use DALA">
        <p>You must be at least 18 years old to create a DALA account. By signing up, you confirm that:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You are 18 or older.</li>
          <li>You have the legal capacity to enter into these Terms.</li>
          <li>All information you provide is accurate and truthful.</li>
          <li>You have not been convicted of, or are not required to register as, a sexual offender.</li>
          <li>You are not currently barred from using DALA under applicable law.</li>
        </ul>
      </Section>

      <Section title="3. Your account">
        <p>
          You're responsible for keeping your login credentials secure and for all activity on
          your account. Notify us immediately if you suspect unauthorized access. You may not
          create an account on behalf of someone else, create multiple accounts to evade a ban,
          or impersonate any person or entity.
        </p>
      </Section>

      <Section title="4. Your content">
        <p>
          You retain ownership of the photos, messages, and profile information you post
          ("Your Content"). By posting it on DALA, you grant us a non-exclusive, worldwide,
          royalty-free license to host, display, and distribute Your Content solely for the
          purpose of operating and improving DALA.
        </p>
        <p>You agree not to post content that:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Is false, misleading, or impersonates someone else.</li>
          <li>Is sexually explicit, violent, or depicts minors in any way.</li>
          <li>Harasses, threatens, or discriminates against others.</li>
          <li>Promotes illegal activity, scams, or spam.</li>
          <li>Infringes someone else's intellectual property or privacy.</li>
        </ul>
      </Section>

      <Section title="5. Community conduct">
        <p>DALA is meant to be a safe space to build real connections. You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Solicit money, gifts, or financial information from other users.</li>
          <li>Use DALA for commercial solicitation, advertising, or recruitment without our consent.</li>
          <li>Harass, stalk, or intimidate other users, on or off the platform.</li>
          <li>Attempt to bypass, hack, or disrupt DALA's systems or security.</li>
          <li>Scrape, copy, or reuse other users' data or content without permission.</li>
        </ul>
        <p>
          Violating these rules may result in a warning, suspension, or permanent termination of
          your account, at our discretion.
        </p>
      </Section>

      <Section title="6. Premium subscriptions">
        <p>
          DALA offers optional paid Premium features. Prices, features, and billing terms will be
          clearly shown before you subscribe. Subscriptions may renew automatically unless
          cancelled; you can manage or cancel your subscription from your account settings.
          Fees are generally non-refundable except where required by law.
        </p>
      </Section>

      <Section title="7. Safety disclaimer">
        <p>
          DALA does not conduct criminal background checks on its users. We encourage you to
          review our{' '}
          <a href="/safety" className="text-orange-500 font-semibold underline underline-offset-2">
            Safety Guidelines
          </a>{' '}
          before meeting anyone in person. You are solely responsible for your interactions with
          other users, both online and offline. DALA is not responsible for the conduct of any
          user, on or off the platform.
        </p>
      </Section>

      <Section title="8. Termination">
        <p>
          You may delete your account at any time. We may suspend or terminate your account if
          you violate these Terms, engage in conduct that harms other users or DALA, or as
          required by law.
        </p>
      </Section>

      <Section title="9. Disclaimers & limitation of liability">
        <p>
          DALA is provided "as is" without warranties of any kind. We do not guarantee that
          you will find a match, connection, or specific outcome from using DALA. To the fullest
          extent permitted by law, DALA and its team are not liable for any indirect, incidental,
          or consequential damages arising from your use of the platform.
        </p>
      </Section>

      <Section title="10. Changes to these terms">
        <p>
          We may update these Terms from time to time. If we make material changes, we'll notify
          you via email or an in-app notice. Continued use of DALA after changes take effect
          means you accept the updated Terms.
        </p>
      </Section>

      <Section title="11. Contact us">
        <p>
          Questions about these Terms? Reach out at{' '}
          <a href="mailto:carasunbrany@gmail.com" className="text-orange-500 font-semibold underline underline-offset-2">
            carasunbrany@gmail.com
          </a>.
        </p>
      </Section>
    </LegalPageLayout>
  );
}

import { useSEO } from '@/hooks/useSEO';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const faqs: { question: string; answer: string }[] = [
  {
    question: 'What is DALA?',
    answer:
      "DALA is a community platform for building meaningful, authentic connections — whether that's a friendship, a mentor, a father or mother figure, a sibling-like bond, or a romantic relationship. Think of it as finding your chosen family.",
  },
  {
    question: 'Is DALA free to use?',
    answer:
      'Yes! Creating an account, building your profile, browsing Discover, and messaging are all free. DALA Premium is an optional paid upgrade with extra features.',
  },
  {
    question: 'How do I sign up?',
    answer:
      "Tap Create Account, enter your email and a password, and we'll send a 6-digit code to your email. Enter that code in the app to confirm your account, then complete your profile.",
  },
  {
    question: "I didn't receive my confirmation code. What do I do?",
    answer:
      "First, check your spam or promotions folder. If it's still not there, use the 'Resend code' button on the verification screen. Codes expire after 1 hour, so if some time has passed, request a new one.",
  },
  {
    question: 'I forgot my password. How do I reset it?',
    answer:
      "On the sign-in screen, tap 'Forgot password?', enter your email, and we'll send you a 6-digit code. Enter the code along with your new password to regain access.",
  },
  {
    question: 'How does matching / Discover work?',
    answer:
      'Discover shows you profiles based on your preferences (like age range, location, and what you\'re looking for). You can browse profiles and reach out to people you\'d like to connect with.',
  },
  {
    question: 'Do I need a profile picture?',
    answer:
      "It's strongly recommended! Profiles with a photo get far more views and connections. You can add or update your photo anytime from your profile page.",
  },
  {
    question: "What's included in DALA Premium?",
    answer:
      'Premium unlocks additional features to help you connect more easily. Visit the Premium page in the app for full, up-to-date details on what\'s included.',
  },
  {
    question: 'How do I report or block someone?',
    answer:
      "If someone makes you uncomfortable or violates our community guidelines, you can block them from their profile or a conversation. For serious concerns, please contact us directly so we can investigate.",
  },
  {
    question: 'Can I delete my account?',
    answer:
      'Yes. Contact us and we\'ll delete your account and associated personal data, as described in our Privacy Policy.',
  },
  {
    question: 'Is it safe to meet someone from DALA in person?',
    answer:
      "Please read our Safety Guidelines before meeting anyone in person. Always meet in a public place, tell a friend or family member where you're going, and trust your instincts.",
  },
  {
    question: 'How do I contact support?',
    answer:
      'Email us anytime at carasunbrany@gmail.com and we\'ll get back to you as soon as we can.',
  },
];

export function FAQ() {
  useSEO({
    title: 'Frequently Asked Questions | DALA',
    description: 'Answers to common questions about signing up, safety, Premium, and using DALA.',
    canonicalPath: '/faq',
  });

  return (
    <LegalPageLayout
      title="Frequently Asked Questions"
      subtitle="Everything you need to know about using DALA."
    >
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-bold text-slate-900 hover:text-orange-500">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-slate-600 leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <p className="text-sm text-slate-500 pt-6 mt-4 border-t border-slate-100">
        Still have questions?{' '}
        <a href="mailto:carasunbrany@gmail.com" className="text-orange-500 font-semibold underline underline-offset-2">
          Contact us
        </a>{' '}
        — we're happy to help.
      </p>
    </LegalPageLayout>
  );
}

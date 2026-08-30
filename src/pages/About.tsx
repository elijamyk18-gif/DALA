import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Check, Sparkles, Users, Target } from 'lucide-react';

const SITE_TITLE = 'DALA – Connect, Match & Find Community | dala.home.kg';
const SITE_DESC = 'DALA is a community platform for connecting, matching, and building meaningful relationships.';

const steps = [
  {
    icon: Users,
    title: 'Sign up and create your profile',
    description: 'Tell the community who you are. Share your interests, passions, and what you’re looking for.',
  },
  {
    icon: Sparkles,
    title: 'Discover people who share your interests',
    description: 'Browse profiles and find people who vibe with your hobbies, values, and goals.',
  },
  {
    icon: Heart,
    title: 'Match and start a conversation',
    description: 'When you find a connection, start chatting and build something real.',
  },
  {
    icon: Target,
    title: 'Join events and meet in person',
    description: 'Take it offline. Attend community events and meet your chosen family face to face.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
} as const;

export function About() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'About DALA | Connect, Match & Find Community';

    const meta = document.querySelector('meta[name="description"]');
    const prevContent = meta?.getAttribute('content') ?? SITE_DESC;
    if (meta) meta.setAttribute('content', 'Learn how DALA helps you connect, match, and build meaningful relationships through events and community.');

    return () => {
      document.title = prevTitle;
      if (meta) meta.setAttribute('content', prevContent);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-rose-200/20 blur-3xl" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400 shadow-lg">
              <Heart className="h-7 w-7 text-white" fill="currentColor" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            About DALA
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            DALA is a community platform built to help people connect, match, and build
            meaningful relationships. Whether you're looking to meet new people, join local
            events, or find your home away from home, DALA brings people together in one place.
          </p>
        </motion.div>
      </section>

      {/* How DALA Works Section */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              How DALA Works
            </h2>
            <p className="mx-auto max-w-xl text-slate-600">
              Four simple steps to finding your people.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 md:p-8"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 text-orange-600">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center shadow-xl md:p-12"
        >
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Heart className="h-6 w-6 text-orange-400" fill="currentColor" />
            </div>
          </div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
            Ready to find your community?
          </h2>
          <p className="mb-8 text-base leading-relaxed text-slate-300">
            Join DALA today and start building meaningful connections.
          </p>
          <Link to="/login">
            <Button
              size="lg"
              className="h-12 rounded-xl bg-gradient-to-r from-orange-400 to-rose-400 px-8 text-base font-bold text-white shadow-lg transition-all hover:from-orange-500 hover:to-rose-500 hover:shadow-xl active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
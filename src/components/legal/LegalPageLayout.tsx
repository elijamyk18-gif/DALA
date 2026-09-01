import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, subtitle, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-orange-50/20 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-orange-500 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dala
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-3 text-slate-500 text-lg">{subtitle}</p>}
        {lastUpdated && (
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            Last updated: {lastUpdated}
          </p>
        )}

        <div className="mt-10 space-y-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6 md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

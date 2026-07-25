import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Authentication — Prompt2Form',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex selection:bg-zinc-700 selection:text-white" style={{ background: '#09090b', color: '#f4f4f5' }}>
      {/* ── Left panel — minimalist brand ── */}
      <div className="hidden lg:flex lg:w-[48%] border-r border-zinc-800 flex-col justify-between p-12 bg-zinc-950">
        {/* Logo */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-black text-xs">
              P2F
            </div>
            <span className="text-white font-bold text-base tracking-tight">Prompt2Form</span>
          </Link>
        </div>

        {/* Content */}
        <div className="space-y-6 max-w-md">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-zinc-800 bg-zinc-900/60 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Form Builder Platform
            </div>
            <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight">
              Create, customize, and publish forms in seconds.
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Generate dynamic form schemas from text prompts, tweak grid layouts visually, and export responses seamlessly.
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
            {[
              'Generate multi-field form schemas from text prompts',
              'Visual Paper Canvas with 100%, 50%, and 33% grid width controls',
              'Automated Nodemailer email alerts and Google Sheets row sync',
              'Interactive response CRM and one-click CSV export',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5 text-xs text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-600">
          © {new Date().getFullYear()} Prompt2Form. All rights reserved.
        </div>
      </div>

      {/* ── Right panel — auth forms ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 min-h-screen bg-zinc-950">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-black text-xs">
              P2F
            </div>
            <span className="font-bold text-base text-white">Prompt2Form</span>
          </Link>
        </div>

        <div className="w-full max-w-[380px]">
          {children}
        </div>
      </div>
    </div>
  );
}

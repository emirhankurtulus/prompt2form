'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles, ArrowRight, Wand2, Layout, Zap, Globe2,
  CheckCircle2, BarChart3, Mail, Code2, ChevronDown,
  LogOut, Monitor, Tablet, Smartphone, Type, AlignLeft,
  GripVertical, Copy, Trash2, Plus, Palette, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Form Generator',
    desc: 'Transform plain text prompts into structured multi-field form schemas in seconds.',
  },
  {
    icon: Layout,
    title: 'Visual Paper Builder',
    desc: 'Customize form layouts on an interactive paper sheet with 100%, 50%, and 33% grid width controls.',
  },
  {
    icon: Zap,
    title: 'Instant Integrations',
    desc: 'Connect Nodemailer email alerts, HTTP POST Webhooks, and live Google Sheets Apps Script sync.',
  },
  {
    icon: BarChart3,
    title: 'Response CRM & CSV Export',
    desc: 'View submission details in an interactive modal, track views, and export response records to CSV.',
  },
];

const FAQS = [
  {
    q: 'How does Prompt2Form create forms?',
    a: 'Prompt2Form analyzes your natural text prompt and constructs a structured multi-field form JSON schema containing field types, labels, and placeholders.',
  },
  {
    q: 'Can I embed generated forms on my site?',
    a: 'Yes. Publishing a form gives you a direct public URL (/f/[slug]) and a clean HTML <iframe> embed snippet ready to paste into any platform.',
  },
  {
    q: 'Which integrations are available and working?',
    a: 'The platform features 3 fully-functional integrations: SMTP Email notifications, Custom Webhooks HTTP POST, and Google Sheets row syncing.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isAuthenticated = Boolean(user);

  const handleSignOut = () => {
    logout();
    router.refresh();
  };

  return (
    <div className="min-h-screen font-sans selection:bg-zinc-700 selection:text-white" style={{ background: '#09090b', color: '#f4f4f5' }}>
      {/* ─── Top Navbar ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-zinc-800/80 bg-zinc-950/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-zinc-950 font-black">
              P2F
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Prompt2Form
            </span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 transition-all flex items-center gap-1.5"
                >
                  <Layout size={13} /> Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5 border border-zinc-800"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 transition-all flex items-center gap-1"
                >
                  Get Started <ArrowRight size={13} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <section className="pt-16 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> AI-Powered Form Builder
          </div>

          {/* High-Contrast Pure White Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
            Build, Customize, and Publish <br />
            <span className="text-zinc-400 font-bold">
              Web Forms in Seconds
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Generate form schemas from text prompts, fine-tune field layouts visually on an interactive paper canvas with grid column controls, and publish with ready embed code.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href={isAuthenticated ? '/dashboard/forms/new' : '/sign-up'}
              className="px-5 py-3 rounded-xl font-bold text-zinc-950 text-xs bg-white hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-sm"
            >
              <Wand2 size={15} /> Create Form with AI
            </Link>
            <Link
              href={isAuthenticated ? '/dashboard' : '/sign-in'}
              className="px-5 py-3 rounded-xl font-semibold text-zinc-300 hover:text-white border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 transition-all flex items-center gap-2 text-xs"
            >
              <Layout size={15} /> Open Dashboard
            </Link>
          </div>

          {/* ─── Exact Real Builder UI Mockup (Matching App Canvas) ──────────── */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 text-left shadow-2xl overflow-hidden">
              {/* Builder Header Bar */}
              <div className="h-12 border-b border-zinc-800 px-4 flex items-center justify-between bg-zinc-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">
                    ←
                  </div>
                  <span className="text-xs font-bold text-white">Job Application & Resume Form</span>
                  <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                    PUBLISHED
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <Monitor size={13} className="text-purple-400" />
                    <Tablet size={13} className="text-zinc-600" />
                    <Smartphone size={13} className="text-zinc-600" />
                  </div>
                  <span className="px-3 py-1 rounded-lg text-xs font-bold text-zinc-950 bg-white">
                    Share & Embed
                  </span>
                </div>
              </div>

              {/* 3-Column Builder Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px] bg-zinc-950">
                {/* Left: Components Library */}
                <div className="hidden md:block md:col-span-3 border-r border-zinc-800 p-3 space-y-3 bg-zinc-950">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Components
                  </div>
                  <div className="space-y-1">
                    {[
                      { name: 'Short Text', icon: Type },
                      { name: 'Paragraph', icon: AlignLeft },
                      { name: 'Email Input', icon: Mail },
                      { name: 'Dropdown Select', icon: ChevronDown },
                    ].map((comp) => {
                      const Icon = comp.icon;
                      return (
                        <div key={comp.name} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300">
                          <div className="flex items-center gap-2">
                            <Icon size={12} className="text-purple-400" />
                            <span>{comp.name}</span>
                          </div>
                          <Plus size={11} className="text-zinc-600" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Center: Visual Paper Sheet Canvas */}
                <div className="col-span-1 md:col-span-6 p-4 sm:p-6 flex flex-col items-center justify-center bg-zinc-900/30">
                  <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-xl">
                    <div className="border-b border-zinc-800 pb-3 space-y-1">
                      <h3 className="text-base font-bold text-white">Candidate Information</h3>
                      <p className="text-xs text-zinc-400">Please provide your details below.</p>
                    </div>

                    {/* Canvas Items with Width Tags & Toolbars */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="col-span-1 relative p-2.5 rounded-lg border border-purple-500/60 bg-zinc-900 space-y-1">
                        <div className="absolute -top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[9px] text-purple-400 font-bold">
                          50% Width
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-200">First Name *</span>
                        <div className="h-7 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-500 px-2 flex items-center">Jane</div>
                      </div>

                      <div className="col-span-1 relative p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 space-y-1">
                        <div className="absolute -top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-500">
                          50% Width
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-200">Last Name *</span>
                        <div className="h-7 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-500 px-2 flex items-center">Smith</div>
                      </div>

                      <div className="col-span-2 relative p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 space-y-1">
                        <div className="absolute -top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-500">
                          100% Width
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-200">Cover Letter</span>
                        <div className="h-10 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-500 p-2">Brief candidate summary...</div>
                      </div>
                    </div>

                    <button className="w-full py-2 rounded-lg text-xs font-bold text-zinc-950 bg-white">
                      Submit Application
                    </button>
                  </div>
                </div>

                {/* Right: Field Properties & Theme Sidebar */}
                <div className="hidden md:block md:col-span-3 border-l border-zinc-800 p-3 space-y-3 bg-zinc-950 text-xs">
                  <div className="flex border-b border-zinc-800 pb-2">
                    <span className="font-bold text-white pr-3 border-r border-zinc-800">Field</span>
                    <span className="text-zinc-500 font-semibold pl-3">Theme</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-zinc-400">Column Width</label>
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-center">
                      <span className="bg-purple-600 text-white rounded py-1">100%</span>
                      <span className="text-zinc-400 py-1">50%</span>
                      <span className="text-zinc-400 py-1">33%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-400">Field Label</label>
                    <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 text-[11px]">First Name</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─────────────────────────────────────────────────── */}
      <section id="features" className="py-16 border-t border-zinc-800 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Core Features</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">Built for Maximum Efficiency</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-2.5 hover:border-zinc-700 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-base font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Workflow Steps ─────────────────────────────────────────────────── */}
      <section id="workflow" className="py-16 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Workflow</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">3 Simple Steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Prompt Input', desc: 'Type your requirements. Field types, validation rules, and labels are generated.' },
              { step: '02', title: 'Visual Grid Styling', desc: 'Adjust grid column widths (100%, 50%, 33%), colors, and reorder fields.' },
              { step: '03', title: 'Publish & Embed', desc: 'Copy direct form URLs or paste the HTML <iframe> embed code on your site.' },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-2 relative">
                <span className="text-xs font-mono font-bold text-zinc-500">{s.step}</span>
                <h4 className="text-sm font-bold text-white">{s.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ───────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 border-t border-zinc-800 bg-zinc-950/50">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">FAQ</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={faq.q} className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={cn('text-zinc-400 transition-transform duration-200', openFaq === idx && 'rotate-180 text-white')}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800 py-8 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center text-zinc-950 font-black text-xs">
              P2F
            </div>
            <span className="text-xs font-bold text-white">Prompt2Form</span>
          </div>

          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Prompt2Form. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs text-zinc-400">
            {isAuthenticated && <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>}
            <Link href="/dashboard/help" className="hover:text-white transition-colors">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

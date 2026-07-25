'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles, ArrowRight, Loader2, CheckCircle2,
  FileText, ChevronRight, Wand2, Lightbulb, Clock,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

// ─── Example prompts ──────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  {
    icon: '🦷',
    label: 'Dental Appointment',
    prompt: 'Create a dental appointment booking form with patient name, date of birth, phone number, preferred appointment date and time, dentist selection from a dropdown (Dr. Smith, Dr. Johnson, Dr. Williams), reason for visit, symptoms description, insurance information, and GDPR consent checkbox.',
  },
  {
    icon: '📋',
    label: 'Job Application',
    prompt: 'Create a professional job application form with full name, email, phone, LinkedIn profile URL, desired position dropdown, years of experience slider (0-20), education level, skills multi-select, cover letter paragraph, resume file upload, and availability date.',
  },
  {
    icon: '⭐',
    label: 'Customer Feedback',
    prompt: 'Create a customer satisfaction survey with overall experience rating (1-5 stars), service quality rating, product quality rating, would recommend radio (Yes/No/Maybe), what we did well textarea, areas for improvement textarea, and email for follow-up.',
  },
  {
    icon: '🏥',
    label: 'Patient Intake',
    prompt: 'Create a medical patient intake form with full name, date of birth, address, emergency contact name and phone, primary insurance provider, policy number, list of current medications textarea, allergies multi-select, medical history checkboxes, and HIPAA consent.',
  },
  {
    icon: '🎓',
    label: 'Course Registration',
    prompt: 'Create a university course registration form with student ID, full name, email, semester dropdown (Fall/Spring/Summer), year of study, course selection multi-select, learning objectives textarea, special accommodations checkbox, and terms agreement.',
  },
  {
    icon: '🏢',
    label: 'Event Registration',
    prompt: 'Create a corporate event registration form with full name, company, job title, email, phone, dietary requirements dropdown (None/Vegetarian/Vegan/Halal/Kosher), session preferences multi-select, workshop choices, t-shirt size radio, and payment method.',
  },
];

// ─── Generation steps display ─────────────────────────────────────────────────

const STEPS = [
  { key: 'analyzing', label: 'Analyzing your prompt...', icon: '🔍' },
  { key: 'generating', label: 'Generating form structure...', icon: '⚡' },
  { key: 'parsing', label: 'Validating & optimizing...', icon: '✨' },
  { key: 'saving', label: 'Saving your form...', icon: '💾' },
];

export default function NewFormPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [generatedFormId, setGeneratedFormId] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    textareaRef.current?.focus();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStepIndex(0);
    setCurrentStatus('');
    setDone(false);

    try {
      const response = await fetch('/api/forms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        if (err.code === 'FORM_LIMIT_EXCEEDED') {
          toast.error(err.error, { duration: 6000 });
        } else {
          toast.error(err.error || 'Failed to generate form');
        }
        setIsGenerating(false);
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === 'status') {
            setCurrentStatus(data.message);
            // Advance step display
            if (data.message.includes('Analyzing')) setStepIndex(0);
            else if (data.message.includes('Generating')) setStepIndex(1);
            else if (data.message.includes('Parsing') || data.message.includes('validating')) setStepIndex(2);
            else if (data.message.includes('Saving')) setStepIndex(3);
          } else if (data.type === 'complete') {
            setDone(true);
            setGeneratedFormId(data.formId);
            setStepIndex(4);
            toast.success('Form generated successfully!');
          } else if (data.type === 'error') {
            const code = data.code as string | undefined;
            if (code === 'RATE_LIMIT') {
              toast.error(data.message, { duration: 8000 });
              // Start a 10s countdown
              setRetryCountdown(10);
              const interval = setInterval(() => {
                setRetryCountdown((prev) => {
                  if (prev <= 1) { clearInterval(interval); return 0; }
                  return prev - 1;
                });
              }, 1000);
            } else {
              toast.error(data.message || 'Generation failed', { duration: 5000 });
            }
            setIsGenerating(false);
            return;
          }
        }
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      if (!done) setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-full flex flex-col" style={{ background: 'var(--background-secondary)' }}>
      <div className="flex-1 flex flex-col items-center justify-start px-4 py-10 max-w-4xl mx-auto w-full">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-10"
        >
          <div className="flex justify-center mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--primary), hsl(300,60%,50%))' }}
            >
              <Wand2 size={26} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Create form with AI
          </h1>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--foreground-muted)' }}>
            Describe the form you need in plain language. AI will generate a complete, professional form in seconds.
          </p>
        </motion.div>

        {/* Main prompt card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full rounded-2xl border p-5 space-y-4 shadow-sm"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="Describe your form... e.g. &quot;Create a dental appointment booking form with patient name, phone number, preferred date, doctor selection, symptoms and GDPR consent&quot;"
              rows={5}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:opacity-50 disabled:opacity-50"
              style={{
                background: 'var(--background-secondary)',
                border: '1.5px solid var(--border)',
                color: 'var(--foreground)',
                lineHeight: '1.6',
              }}
            />
            <div className="absolute bottom-3 right-3 text-xs" style={{ color: 'var(--foreground-subtle)' }}>
              {prompt.length}/2000 · <span className="opacity-60">⌘↵ to generate</span>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || retryCountdown > 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--primary), hsl(300,60%,50%))' }}
          >
            {isGenerating ? (
              <><Loader2 size={16} className="animate-spin" /> Generating...</>
            ) : retryCountdown > 0 ? (
              <><Clock size={16} /> Try again in {retryCountdown}s</>
            ) : (
              <><Sparkles size={16} /> Generate Form with AI</>
            )}
          </button>
        </motion.div>

        {/* Generation progress */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full mt-5 rounded-2xl border p-5 space-y-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                AI is working...
              </h3>
              <div className="space-y-2.5">
                {STEPS.map((step, i) => (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all',
                        i < stepIndex
                          ? 'bg-green-500 text-white'
                          : i === stepIndex
                          ? 'border-2 animate-pulse'
                          : 'border',
                      )}
                      style={{
                        borderColor: i === stepIndex ? 'var(--primary)' : 'var(--border)',
                        background: i < stepIndex ? '#22c55e' : i === stepIndex ? 'rgba(124,58,237,0.1)' : 'var(--background-secondary)',
                        color: i === stepIndex ? 'var(--primary)' : undefined,
                      }}
                    >
                      {i < stepIndex ? (
                        <CheckCircle2 size={12} />
                      ) : i === stepIndex ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <span className="opacity-40">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className="text-sm transition-all"
                      style={{
                        color: i <= stepIndex ? 'var(--foreground)' : 'var(--foreground-subtle)',
                        fontWeight: i === stepIndex ? 600 : 400,
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success state */}
        <AnimatePresence>
          {done && generatedFormId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full mt-5 rounded-2xl border p-6 text-center space-y-4"
              style={{ background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.25)' }}
            >
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <CheckCircle2 size={24} style={{ color: '#22c55e' }} />
                </div>
              </div>
              <div>
                <p className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>Form created successfully!</p>
                <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>Your AI-generated form is ready. Open the builder to customize it.</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push(`/dashboard/forms/${generatedFormId}/builder`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{ background: 'var(--primary)' }}
                >
                  Open Builder <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => {
                    setDone(false);
                    setPrompt('');
                    setIsGenerating(false);
                    setGeneratedFormId(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--card-hover)]"
                  style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }}
                >
                  Create another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example prompts */}
        {!isGenerating && !done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full mt-8 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={14} style={{ color: 'var(--foreground-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
                Example prompts — click to use:
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example.label}
                  onClick={() => handleExampleClick(example.prompt)}
                  className="text-left p-3.5 rounded-xl border transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.98] group"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg flex-shrink-0 leading-none mt-0.5">{example.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                        {example.label}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>
                        {example.prompt.slice(0, 80)}...
                      </p>
                    </div>
                    <ChevronRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" style={{ color: 'var(--primary)' }} />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Manual create option */}
        {!isGenerating && !done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Prefer to build manually?{' '}
              <button
                onClick={() => router.push('/dashboard/forms/manual')}
                className="font-medium hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Start with a blank form →
              </button>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

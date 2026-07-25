'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, Sparkles, FileText, ArrowRight, Loader2,
  Star, Users, Heart, ShoppingCart, Clipboard, GraduationCap,
  Building2, Stethoscope, CalendarDays, MessageSquare, BarChart3,
  HelpCircle, Briefcase, PartyPopper, Plane, UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Template data ──────────────────────────────────────────────────────────

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  fieldCount: number;
  uses: number;
  prompt: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'contact',
    title: 'Contact Form',
    description: 'Simple name, email, and message form for website inquiries.',
    category: 'General',
    icon: <MessageSquare size={20} />,
    fieldCount: 4,
    uses: 12400,
    prompt: 'Create a contact form with name, email, subject dropdown (General Inquiry/Support/Partnership/Feedback), and message textarea. All required.',
  },
  {
    id: 'feedback',
    title: 'Customer Feedback',
    description: 'Collect star ratings and detailed feedback from customers.',
    category: 'General',
    icon: <Star size={20} />,
    fieldCount: 6,
    uses: 8700,
    prompt: 'Create a customer feedback form with overall experience 5-star rating, service quality rating, what we did well textarea, areas to improve textarea, would you recommend us radio (Yes/No/Maybe), and email for follow-up.',
  },
  {
    id: 'registration',
    title: 'Event Registration',
    description: 'Sign up attendees with all necessary details.',
    category: 'Events',
    icon: <PartyPopper size={20} />,
    fieldCount: 9,
    uses: 6200,
    prompt: 'Create an event registration form with full name, email, phone, company, job title, dietary requirements dropdown, session preferences multi-select, special accommodations textarea, and terms checkbox.',
  },
  {
    id: 'job-application',
    title: 'Job Application',
    description: 'Professional application form with resume upload.',
    category: 'HR',
    icon: <Briefcase size={20} />,
    fieldCount: 10,
    uses: 9100,
    prompt: 'Create a job application form with full name, email, phone, position applying for dropdown, years of experience number, highest education dropdown, relevant skills multi-select, cover letter textarea, resume file upload, and availability date.',
  },
  {
    id: 'patient-intake',
    title: 'Patient Intake',
    description: 'Medical intake form with health history.',
    category: 'Healthcare',
    icon: <Stethoscope size={20} />,
    fieldCount: 12,
    uses: 4300,
    prompt: 'Create a medical patient intake form with full name, date of birth, gender radio, phone, email, emergency contact name, emergency contact phone, insurance provider, current medications textarea, allergies textarea, medical conditions checkboxes, and consent checkbox.',
  },
  {
    id: 'course-enrollment',
    title: 'Course Enrollment',
    description: 'Student registration for online courses.',
    category: 'Education',
    icon: <GraduationCap size={20} />,
    fieldCount: 8,
    uses: 5600,
    prompt: 'Create a course enrollment form with student name, email, phone, course selection dropdown, semester dropdown (Fall/Spring/Summer), prior experience textarea, learning goals textarea, and terms agreement checkbox.',
  },
  {
    id: 'order',
    title: 'Order Form',
    description: 'Simple product order form with quantity and details.',
    category: 'Business',
    icon: <ShoppingCart size={20} />,
    fieldCount: 8,
    uses: 7400,
    prompt: 'Create a product order form with customer name, email, phone, product selection dropdown, quantity number, size dropdown (S/M/L/XL), delivery address, and special instructions textarea.',
  },
  {
    id: 'survey',
    title: 'Employee Survey',
    description: 'Anonymous workplace satisfaction survey.',
    category: 'HR',
    icon: <BarChart3 size={20} />,
    fieldCount: 10,
    uses: 3800,
    prompt: 'Create an anonymous employee satisfaction survey with department dropdown, how long have you worked here dropdown, job satisfaction 5-star rating, work-life balance rating, management satisfaction rating, what do you enjoy most textarea, what could be improved textarea, likelihood to recommend radio (1-10), additional comments textarea.',
  },
  {
    id: 'booking',
    title: 'Appointment Booking',
    description: 'Schedule appointments with date/time selection.',
    category: 'General',
    icon: <CalendarDays size={20} />,
    fieldCount: 7,
    uses: 8200,
    prompt: 'Create an appointment booking form with full name, email, phone, service type dropdown, preferred date, preferred time, and additional notes textarea.',
  },
  {
    id: 'travel-request',
    title: 'Travel Request',
    description: 'Corporate travel authorization form.',
    category: 'Business',
    icon: <Plane size={20} />,
    fieldCount: 9,
    uses: 2100,
    prompt: 'Create a corporate travel request form with employee name, department dropdown, destination, departure date, return date, purpose of travel dropdown (Client Meeting/Conference/Training/Other), estimated budget number, hotel needed checkbox, and manager approval email.',
  },
  {
    id: 'restaurant-reservation',
    title: 'Restaurant Reservation',
    description: 'Table booking with preferences.',
    category: 'Events',
    icon: <UtensilsCrossed size={20} />,
    fieldCount: 7,
    uses: 3400,
    prompt: 'Create a restaurant reservation form with guest name, phone, email, date, time dropdown, number of guests dropdown (1-10), and special requests textarea.',
  },
  {
    id: 'newsletter',
    title: 'Newsletter Signup',
    description: 'Simple email subscription form.',
    category: 'General',
    icon: <Heart size={20} />,
    fieldCount: 3,
    uses: 15000,
    prompt: 'Create a newsletter signup form with full name, email address, and interests multi-select (Technology/Design/Business/Marketing/Health).',
  },
];

const CATEGORIES = ['All', 'General', 'Business', 'HR', 'Healthcare', 'Education', 'Events'];

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = TEMPLATES.filter((t) => {
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: Template) => {
    setLoadingId(template.id);
    try {
      const res = await fetch('/api/forms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: template.prompt }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === 'complete') {
            toast.success(`"${template.title}" created!`);
            router.push(`/dashboard/forms/${data.formId}/builder`);
            return;
          }
          if (data.type === 'error') {
            toast.error(data.message);
            setLoadingId(null);
            return;
          }
        }
      }
    } catch {
      toast.error('Failed to create form from template.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Templates</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
          Start from a pre-built template. AI generates a full form from the template prompt.
        </p>
      </div>

      {/* Search + Categories */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl p-1 overflow-x-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap', activeCategory === c ? 'text-white' : 'hover:bg-[var(--card-hover)]')}
              style={activeCategory === c ? { background: 'var(--primary)', color: 'white' } : { color: 'var(--foreground-muted)' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* AI create card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-5 flex items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(147,51,234,0.04) 100%)', borderColor: 'rgba(124,58,237,0.2)' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary), hsl(300,60%,50%))' }}>
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Custom AI Generation</p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Describe any form in your own words</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/forms/new')}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 hover:brightness-110"
          style={{ background: 'var(--primary)' }}
        >
          Create with AI <ArrowRight size={13} />
        </button>
      </motion.div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group rounded-2xl border p-5 flex flex-col transition-all hover:shadow-md"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <span style={{ color: 'var(--primary)' }}>{template.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{template.title}</h3>
                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--foreground-muted)' }}>{template.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}>
                {template.fieldCount} fields
              </span>
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                <Users size={10} /> {(template.uses / 1000).toFixed(1)}k uses
              </span>
            </div>

            <div className="mt-auto">
              <button
                onClick={() => handleUseTemplate(template)}
                disabled={!!loadingId}
                className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                {loadingId === template.id ? (
                  <><Loader2 size={13} className="animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={13} /> Use Template</>
                )}
              </button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 space-y-3">
            <HelpCircle size={32} className="mx-auto" style={{ color: 'var(--foreground-subtle)' }} />
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>No templates match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

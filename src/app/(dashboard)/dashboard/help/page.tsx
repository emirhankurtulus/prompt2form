'use client';

import { useState } from 'react';
import { HelpCircle, Sparkles, MessageSquare, BookOpen, ChevronDown, ChevronUp, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';

const FAQS = [
  {
    q: 'How do I create a form using AI?',
    a: 'Simply click "New Form with AI" from your dashboard and describe your form in plain English (e.g., "Dental appointment booking form with patient name, preferred date, doctor selection, and GDPR consent"). The AI will generate a complete, multi-field form in seconds.',
  },
  {
    q: 'How many forms and responses can I get on the Free Plan?',
    a: 'The Free Plan includes up to 4 AI-generated forms per month. There is no limit on the number of responses your forms can receive.',
  },
  {
    q: 'Where can I view my form submissions?',
    a: 'Go to "My Forms", click the context menu next to any form, and select "View Responses". You can inspect submissions in an interactive table, view details, and export them to CSV.',
  },
  {
    q: 'How do Google Sheets and Custom Webhooks work?',
    a: 'Go to the Integrations page, enable Google Sheets or Custom Webhooks, and enter your endpoint URL. Every new response will be automatically synced in real time.',
  },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [supportMsg, setSupportMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSupportMsg('');
      toast.success('Support ticket submitted! We will reply to your email shortly.');
    }, 600);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Help & Support Center</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-muted)' }}>
          Guides, FAQs, AI prompt tips, and technical support for Prompt2Form.
        </p>
      </div>

      {/* AI Prompting Tips Card */}
      <div className="p-5 rounded-2xl border bg-purple-500/5 border-purple-500/20 space-y-3">
        <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
          <Sparkles size={16} /> Pro Tip: Getting Better AI Generation Results
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
          When prompting AI, specify exact field types you want (e.g. phone number, star rating, file upload, dropdown). For example: <em>&quot;Corporate event registration form with attendee full name, corporate email, session choice radio buttons, dietary requirements dropdown, and HIPAA consent checkbox.&quot;</em>
        </p>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden transition-all"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left font-semibold text-sm flex items-center justify-between"
                style={{ color: 'var(--foreground)' }}
              >
                {faq.q}
                {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs leading-relaxed border-t pt-3" style={{ borderColor: 'var(--border)', color: 'var(--foreground-muted)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="rounded-2xl border p-6 space-y-4" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
          <MessageSquare size={18} style={{ color: 'var(--primary)' }} /> Contact Support
        </h2>
        <form onSubmit={handleSendSupport} className="space-y-3">
          <textarea
            rows={3}
            value={supportMsg}
            onChange={(e) => setSupportMsg(e.target.value)}
            placeholder="Describe your question or issue in detail..."
            className="w-full p-3.5 rounded-xl text-sm outline-none resize-none"
            style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
          <button
            type="submit"
            disabled={isSending || !supportMsg.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'var(--primary)' }}
          >
            <Send size={14} /> {isSending ? 'Sending...' : 'Submit Support Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}

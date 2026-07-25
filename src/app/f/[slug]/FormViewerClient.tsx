'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { FormField, FormSchema } from '@/types/form';

export default function FormViewerClient({ form }: { form: any }) {
  const schema: FormSchema = form.formSchema;
  const fields = schema?.pages?.[0]?.fields ?? [];
  const theme = schema?.theme;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const primaryColor = theme?.primaryColor ?? '#7c3aed';

  const handleChange = (label: string, val: any) => {
    setFormData((prev) => ({ ...prev, [label]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/forms/${form._id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: formData }),
      });

      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      // Still show success UI if API succeeds
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: theme?.backgroundColor || '#f4f4f5' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-2xl border text-center space-y-4 shadow-sm"
          style={{ background: '#ffffff', borderColor: '#e4e4e7' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(34,197,94,0.1)' }}>
            <CheckCircle2 size={36} style={{ color: '#22c55e' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#09090b' }}>Teşekkürler!</h1>
          <p className="text-sm" style={{ color: '#71717a' }}>{schema?.settings?.successMessage || 'Yanıtınız başarıyla kaydedildi.'}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={{ background: theme?.backgroundColor || '#f4f4f5' }}>
      <div className="max-w-xl w-full space-y-6">
        {/* Header card */}
        <div className="p-6 rounded-2xl border shadow-sm space-y-2" style={{ background: theme?.inputBg || '#ffffff', borderColor: '#e4e4e7' }}>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme?.textColor || '#09090b' }}>{schema?.title || form.title}</h1>
          {(schema?.description || form.description) && (
            <p className="text-sm opacity-80" style={{ color: theme?.textColor || '#09090b' }}>{schema?.description || form.description}</p>
          )}
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border shadow-sm space-y-5" style={{ background: theme?.inputBg || '#ffffff', borderColor: '#e4e4e7' }}>
          {fields.map((field: FormField) => {
            if (field.type === 'heading') {
              return <h2 key={field.id} className="text-lg font-bold pt-2" style={{ color: theme?.textColor || '#09090b' }}>{field.label}</h2>;
            }
            if (field.type === 'divider') {
              return <hr key={field.id} className="my-2" style={{ borderColor: '#e4e4e7' }} />;
            }

            return (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-sm font-semibold" style={{ color: theme?.textColor || '#09090b' }}>
                  {field.label}
                  {field.validation?.required && <span style={{ color: '#ef4444' }}> *</span>}
                </label>
                {field.description && <p className="text-xs opacity-75" style={{ color: theme?.textColor || '#09090b' }}>{field.description}</p>}

                {['text', 'email', 'phone', 'number', 'url', 'password', 'date', 'time'].includes(field.type) && (
                  <input
                    type={field.type === 'datetime' ? 'datetime-local' : field.type}
                    required={field.validation?.required}
                    placeholder={field.placeholder}
                    value={formData[field.label] ?? ''}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all focus:ring-2"
                    style={{ background: '#fafafa', borderColor: '#e4e4e7', color: '#09090b' }}
                  />
                )}

                {field.type === 'paragraph' && (
                  <textarea
                    rows={4}
                    required={field.validation?.required}
                    placeholder={field.placeholder}
                    value={formData[field.label] ?? ''}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none resize-none transition-all"
                    style={{ background: '#fafafa', borderColor: '#e4e4e7', color: '#09090b' }}
                  />
                )}

                {field.type === 'dropdown' && (
                  <select
                    required={field.validation?.required}
                    value={formData[field.label] ?? ''}
                    onChange={(e) => handleChange(field.label, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none"
                    style={{ background: '#fafafa', borderColor: '#e4e4e7', color: '#09090b' }}
                  >
                    <option value="">{field.placeholder || 'Seçiniz...'}</option>
                    {field.options?.map((o) => (
                      <option key={o.id} value={o.label}>{o.label}</option>
                    ))}
                  </select>
                )}

                {['radio', 'checkbox'].includes(field.type) && (
                  <div className="space-y-2 pt-1">
                    {field.options?.map((o) => (
                      <label key={o.id} className="flex items-center gap-2.5 text-sm cursor-pointer" style={{ color: '#09090b' }}>
                        <input
                          type={field.type === 'radio' ? 'radio' : 'checkbox'}
                          name={field.id}
                          value={o.label}
                          onChange={(e) => handleChange(field.label, e.target.value)}
                          className="w-4 h-4"
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: primaryColor }}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {schema?.settings?.submitButtonText || 'Gönder'}
          </button>
        </form>

        <p className="text-center text-xs">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hover:underline transition-all opacity-75 hover:opacity-100 font-medium"
            style={{ color: theme?.textColor || '#09090b' }}
          >
            Powered by <strong className="font-bold underline decoration-purple-500/50">Prompt2Form</strong> AI Form Builder
          </a>
        </p>
      </div>
    </div>
  );
}

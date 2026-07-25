'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Download, Search, Star, ArrowLeft, Loader2, X, Calendar, FileText,
  User, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface ResponseItem {
  _id: string;
  answers: Record<string, unknown>;
  starred: boolean;
  createdAt: string;
}

export default function FormResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const [search, setSearch] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(null);

  // Fetch form title
  const { data: formData } = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}`);
      return res.json();
    },
  });

  // Fetch real responses from MongoDB
  const { data: responsesData, isLoading } = useQuery({
    queryKey: ['responses', formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}/responses`);
      return res.json();
    },
  });

  const form = formData?.data;
  const responses: ResponseItem[] = responsesData?.data ?? [];

  // Filter responses by search term
  const filteredResponses = responses.map((r: any) => ({
    ...r,
    answers: r.data || r.answers || {},
  })).filter((r) => {
    if (!search) return true;
    const jsonStr = JSON.stringify(r.answers).toLowerCase();
    return jsonStr.includes(search.toLowerCase());
  });

  const exportCSV = () => {
    if (responses.length === 0) {
      toast.error('No responses to export');
      return;
    }

    // Extract all column headers dynamically
    const headersSet = new Set<string>();
    responses.forEach((r) => {
      Object.keys(r.answers || {}).forEach((h) => headersSet.add(h));
    });
    const headers = Array.from(headersSet);

    let csv = ['Submitted At', ...headers].join(',') + '\n';
    responses.forEach((r) => {
      const row = [
        `"${new Date(r.createdAt).toLocaleString()}"`,
        ...headers.map((h) => `"${String(r.answers[h] ?? '').replace(/"/g, '""')}"`),
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form?.slug || 'form'}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Responses exported to CSV!');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/forms')}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--card-hover)] transition-colors"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              Responses: {form?.title ?? 'Form'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--foreground-muted)' }}>
              {responses.length} submission{responses.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          disabled={responses.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-[var(--card-hover)] disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table Container */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="p-4 border-b flex items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--foreground-muted)' }} />
            <input
              type="text"
              placeholder="Search responses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Loading responses...</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <FileText size={32} className="mx-auto" style={{ color: 'var(--foreground-subtle)' }} />
            <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>No responses found</p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Share your public form link to start collecting submissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ background: 'var(--background-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <th className="p-3.5 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Submitted At</th>
                  <th className="p-3.5 font-semibold" style={{ color: 'var(--foreground-muted)' }}>Preview Answers</th>
                  <th className="p-3.5 text-right font-semibold" style={{ color: 'var(--foreground-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResponses.map((r) => {
                  const firstFew = Object.entries(r.answers || {})
                    .slice(0, 3)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' | ');

                  return (
                    <tr key={r._id} className="border-b transition-colors hover:bg-[var(--card-hover)]" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3.5 text-xs font-mono whitespace-nowrap" style={{ color: 'var(--foreground-muted)' }}>
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-medium max-w-md truncate" style={{ color: 'var(--foreground)' }}>
                        {firstFew || 'No answers'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedResponse(r)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: 'var(--primary)', color: 'white' }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div
            className="w-full max-w-lg rounded-2xl border p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Response Details</h3>
                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                  Submitted on {new Date(selectedResponse.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--card-hover)]"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {Object.entries(selectedResponse.answers || {}).map(([key, val]) => (
                <div key={key} className="p-3 rounded-xl space-y-1" style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)' }}>
                  <span className="text-xs font-semibold block" style={{ color: 'var(--primary)' }}>{key}</span>
                  <span className="text-sm font-medium block whitespace-pre-wrap" style={{ color: 'var(--foreground)' }}>
                    {String(val || '-')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedResponse(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

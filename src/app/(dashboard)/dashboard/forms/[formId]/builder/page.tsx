'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import {
  Plus, Trash2, GripVertical, Save, Eye, ArrowLeft,
  Type, AlignLeft, Mail, Phone, Hash, Link2, Lock, Calendar,
  Clock, CalendarClock, ChevronDown, CheckSquare, Star,
  SlidersHorizontal, Upload, PenTool, MapPin, Globe,
  Minus, Code, EyeOff, LayoutGrid, Heading,
  Monitor, Tablet, Smartphone, Loader2, Copy, X,
  Palette, Layout, Globe2, Share2, ExternalLink, Check, Code2,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import type { FormField, FormSchema, FieldType, FormTheme } from '@/types/form';

// ─── Field Type Library Config ──────────────────────────────────────────────

interface FieldTypeInfo {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
  category: string;
  defaultWidth?: 'full' | 'half' | 'third';
}

const FIELD_TYPES: FieldTypeInfo[] = [
  { type: 'text', label: 'Short Text', icon: <Type size={14} />, category: 'Input Fields', defaultWidth: 'half' },
  { type: 'paragraph', label: 'Long Text (Paragraph)', icon: <AlignLeft size={14} />, category: 'Input Fields', defaultWidth: 'full' },
  { type: 'email', label: 'Email', icon: <Mail size={14} />, category: 'Input Fields', defaultWidth: 'half' },
  { type: 'phone', label: 'Phone Number', icon: <Phone size={14} />, category: 'Input Fields', defaultWidth: 'half' },
  { type: 'number', label: 'Number', icon: <Hash size={14} />, category: 'Input Fields', defaultWidth: 'half' },
  { type: 'url', label: 'Website URL', icon: <Link2 size={14} />, category: 'Input Fields', defaultWidth: 'half' },
  { type: 'date', label: 'Date', icon: <Calendar size={14} />, category: 'Date & Time', defaultWidth: 'half' },
  { type: 'time', label: 'Time', icon: <Clock size={14} />, category: 'Date & Time', defaultWidth: 'half' },
  { type: 'dropdown', label: 'Dropdown Select', icon: <ChevronDown size={14} />, category: 'Options', defaultWidth: 'half' },
  { type: 'radio', label: 'Single Choice (Radio)', icon: <CheckSquare size={14} />, category: 'Options', defaultWidth: 'half' },
  { type: 'checkbox', label: 'Multiple Choice (Checkbox)', icon: <CheckSquare size={14} />, category: 'Options', defaultWidth: 'half' },
  { type: 'rating', label: 'Star Rating', icon: <Star size={14} />, category: 'Special', defaultWidth: 'full' },
  { type: 'slider', label: 'Slider Range', icon: <SlidersHorizontal size={14} />, category: 'Special', defaultWidth: 'full' },
  { type: 'file-upload', label: 'File Upload', icon: <Upload size={14} />, category: 'Special', defaultWidth: 'full' },
  { type: 'heading', label: 'Heading Text', icon: <Heading size={14} />, category: 'Layout', defaultWidth: 'full' },
  { type: 'divider', label: 'Divider Line', icon: <Minus size={14} />, category: 'Layout', defaultWidth: 'full' },
];

const WIDTH_CLASSES = {
  full: 'w-full',
  half: 'w-full sm:w-[calc(50%-0.5rem)]',
  third: 'w-full sm:w-[calc(33.333%-0.5rem)]',
  quarter: 'w-full sm:w-[calc(25%-0.5rem)]',
};

const PRESET_PALETTES = [
  { name: 'Purple Neon', primary: '#7c3aed', bg: '#f4f4f5', card: '#ffffff', text: '#09090b' },
  { name: 'Midnight Dark', primary: '#3b82f6', bg: '#09090b', card: '#18181b', text: '#f4f4f5' },
  { name: 'Emerald Forest', primary: '#059669', bg: '#ecfdf5', card: '#ffffff', text: '#064e3b' },
  { name: 'Sunset Orange', primary: '#ea580c', bg: '#fff7ed', card: '#ffffff', text: '#431407' },
  { name: 'Rose Pink', primary: '#e11d48', bg: '#fff1f2', card: '#ffffff', text: '#4c0519' },
];

// ─── Visual Canvas Field Item (Dark Mode Compatible) ───────────────────────

function VisualCanvasField({
  field, isSelected, theme, onSelect, onDelete, onDuplicate, onWidthChange,
}: {
  field: FormField; isSelected: boolean; theme?: FormTheme;
  onSelect: () => void; onDelete: () => void; onDuplicate: () => void;
  onWidthChange: (w: 'full' | 'half' | 'third') => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const currentWidth = field.style?.width || 'full';
  const textColor = theme?.textColor || 'var(--foreground)';
  const primaryColor = theme?.primaryColor || 'var(--primary)';

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderRadius: theme?.borderRadius || '16px',
        background: 'var(--card)',
        borderColor: isSelected ? primaryColor : 'var(--border)',
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={cn(
        'group relative p-4 transition-all cursor-pointer border shadow-sm',
        WIDTH_CLASSES[currentWidth],
        isDragging && 'opacity-30 shadow-2xl border-dashed scale-95',
        isSelected ? 'ring-2 border-transparent shadow-md' : 'hover:border-[var(--primary)]/50',
      )}
    >
      {/* Floating Toolbar */}
      <div
        className={cn(
          'absolute -top-3 right-3 z-30 flex items-center gap-1 rounded-lg px-2 py-1 shadow-md border transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5 border-r pr-1.5 mr-0.5" style={{ borderColor: 'var(--border)' }}>
          {(['full', 'half', 'third'] as const).map((w) => (
            <button
              key={w}
              onClick={() => onWidthChange(w)}
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors',
                currentWidth === w ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--card-hover)] text-[var(--foreground-muted)]',
              )}
            >
              {w === 'full' ? '100%' : w === 'half' ? '50%' : '33%'}
            </button>
          ))}
        </div>

        <button {...listeners} {...attributes} className="p-1 rounded hover:bg-[var(--card-hover)] cursor-grab" style={{ color: 'var(--foreground-muted)' }}>
          <GripVertical size={13} />
        </button>
        <button onClick={onDuplicate} className="p-1 rounded hover:bg-[var(--card-hover)]" style={{ color: 'var(--foreground-muted)' }}>
          <Copy size={13} />
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-500/10 text-red-500">
          <Trash2 size={13} />
        </button>
      </div>

      {/* Field Render */}
      <div className="space-y-1.5 pointer-events-none select-none">
        {field.type === 'heading' ? (
          <h2 className="text-xl font-bold" style={{ color: textColor }}>{field.label || 'Add Heading'}</h2>
        ) : field.type === 'divider' ? (
          <hr className="my-2" style={{ borderColor: 'var(--border)' }} />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold" style={{ color: textColor }}>
                {field.label}
                {field.validation?.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <span className="text-[10px] font-medium opacity-60 uppercase tracking-wider" style={{ color: textColor }}>{field.type}</span>
            </div>

            {field.description && <p className="text-xs opacity-75" style={{ color: textColor }}>{field.description}</p>}

            {['text', 'email', 'phone', 'number', 'url', 'password', 'date', 'time'].includes(field.type) && (
              <div
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border font-medium"
                style={{ background: 'var(--background-secondary)', borderColor: 'var(--border)', color: 'var(--foreground-subtle)' }}
              >
                {field.placeholder || `Enter ${field.label}...`}
              </div>
            )}

            {field.type === 'paragraph' && (
              <div
                className="w-full px-3.5 py-3 rounded-xl text-sm border h-20 font-medium"
                style={{ background: 'var(--background-secondary)', borderColor: 'var(--border)', color: 'var(--foreground-subtle)' }}
              >
                {field.placeholder || 'Enter detailed response...'}
              </div>
            )}

            {field.type === 'dropdown' && (
              <div
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border flex items-center justify-between font-medium"
                style={{ background: 'var(--background-secondary)', borderColor: 'var(--border)', color: 'var(--foreground-subtle)' }}
              >
                <span>{field.placeholder || 'Select an option...'}</span>
                <ChevronDown size={14} />
              </div>
            )}

            {['radio', 'checkbox'].includes(field.type) && (
              <div className="space-y-1.5 pt-1">
                {(field.options ?? [{ id: '1', label: 'Option 1' }, { id: '2', label: 'Option 2' }]).map((o) => (
                  <div key={o.id} className="flex items-center gap-2 text-sm" style={{ color: textColor }}>
                    <div className={cn('w-4 h-4 border', field.type === 'radio' ? 'rounded-full' : 'rounded')} style={{ borderColor: 'var(--border)' }} />
                    <span>{o.label}</span>
                  </div>
                ))}
              </div>
            )}

            {field.type === 'rating' && (
              <div className="flex gap-1 py-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={22} style={{ color: primaryColor }} className="fill-current opacity-40" />
                ))}
              </div>
            )}

            {field.type === 'file-upload' && (
              <div
                className="border-2 border-dashed rounded-xl p-4 text-center text-xs flex flex-col items-center gap-1"
                style={{ background: 'var(--background-secondary)', borderColor: 'var(--border)', color: 'var(--foreground-muted)' }}
              >
                <Upload size={18} /> Click or drag file to upload
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Theme Editor Tab ────────────────────────────────────────────────────────

function ThemeEditor({
  theme, onChangeTheme,
}: {
  theme: FormTheme; onChangeTheme: (t: FormTheme) => void;
}) {
  const update = (key: keyof FormTheme, value: string) => {
    onChangeTheme({ ...theme, [key]: value });
  };

  return (
    <div className="space-y-5 p-4 overflow-y-auto h-full">
      <div className="space-y-1 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Theme & Styling</h3>
        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Customize colors, fonts, and background styling for your form.</p>
      </div>

      {/* Preset Palettes */}
      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Preset Color Palettes</label>
        <div className="grid grid-cols-1 gap-2">
          {PRESET_PALETTES.map((p) => (
            <button
              key={p.name}
              onClick={() => onChangeTheme({
                ...theme,
                primaryColor: p.primary,
                backgroundColor: p.bg,
                inputBg: p.card,
                textColor: p.text,
                buttonBg: p.primary,
              })}
              className="flex items-center justify-between p-2.5 rounded-xl border hover:shadow-sm transition-all text-left bg-[var(--card)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{p.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full" style={{ background: p.primary }} />
                <span className="w-4 h-4 rounded-full border" style={{ background: p.bg }} />
                <span className="w-4 h-4 rounded-full border" style={{ background: p.card }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color pickers */}
      <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Custom Colors</h4>

        {/* Primary Color */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Primary Accent Color</p>
            <p className="text-[10px]" style={{ color: 'var(--foreground-subtle)' }}>Submit button & focus outlines</p>
          </div>
          <input
            type="color"
            value={theme.primaryColor || '#7c3aed'}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0"
          />
        </div>

        {/* Page Background */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Page Background</p>
            <p className="text-[10px]" style={{ color: 'var(--foreground-subtle)' }}>Outer area canvas color</p>
          </div>
          <input
            type="color"
            value={theme.backgroundColor || '#f4f4f5'}
            onChange={(e) => update('backgroundColor', e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0"
          />
        </div>

        {/* Card Background */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Form Card Color</p>
            <p className="text-[10px]" style={{ color: 'var(--foreground-subtle)' }}>Inner form sheet background</p>
          </div>
          <input
            type="color"
            value={theme.inputBg || '#ffffff'}
            onChange={(e) => update('inputBg', e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0"
          />
        </div>

        {/* Text Color */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Text Color</p>
            <p className="text-[10px]" style={{ color: 'var(--foreground-subtle)' }}>Headings and field labels</p>
          </div>
          <input
            type="color"
            value={theme.textColor || '#09090b'}
            onChange={(e) => update('textColor', e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border-0"
          />
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Border Radius</label>
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[var(--background-secondary)] border" style={{ borderColor: 'var(--border)' }}>
          {[
            { key: '0px', label: 'Sharp (0)' },
            { key: '8px', label: 'Sm (8)' },
            { key: '16px', label: 'Md (16)' },
            { key: '24px', label: 'Round (24)' },
          ].map((r) => (
            <button
              key={r.key}
              onClick={() => update('borderRadius', r.key)}
              className={cn(
                'py-1.5 rounded-lg text-[10px] font-bold transition-all',
                (theme.borderRadius || '16px') === r.key ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--foreground-muted)] hover:bg-[var(--card)]',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Field Properties Panel ──────────────────────────────────────────────────

function PropertiesPanel({
  field, schema, onChange, onUpdateFormHeader, onClose,
}: {
  field: FormField | null; schema?: FormSchema | null;
  onChange: (f: FormField) => void;
  onUpdateFormHeader?: (title: string, description: string) => void;
  onClose: () => void;
}) {
  if (!field) {
    return (
      <div className="p-4 space-y-4 overflow-y-auto h-full">
        <div className="pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Form Header & Info</h3>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Customize your form title and description.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Form Title</label>
          <input
            type="text"
            value={schema?.title ?? ''}
            onChange={(e) => onUpdateFormHeader?.(e.target.value, schema?.description ?? '')}
            placeholder="Enter form title..."
            className="w-full px-3 py-2 rounded-xl text-sm outline-none font-bold"
            style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Form Description</label>
          <textarea
            rows={3}
            value={schema?.description ?? ''}
            onChange={(e) => onUpdateFormHeader?.(schema?.title ?? '', e.target.value)}
            placeholder="Enter form description..."
            className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none font-medium"
            style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="p-3 rounded-xl bg-[var(--background-secondary)] border text-xs space-y-1" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>💡 Pro Tip</p>
          <p style={{ color: 'var(--foreground-muted)' }}>You can also click directly on the title or description text on the canvas to edit them live.</p>
        </div>
      </div>
    );
  }

  const update = (key: keyof FormField, value: unknown) => {
    onChange({ ...field, [key]: value });
  };

  const updateStyle = (key: string, value: unknown) => {
    onChange({ ...field, style: { ...field.style, [key]: value } });
  };

  const updateValidation = (key: string, value: unknown) => {
    onChange({ ...field, validation: { ...field.validation, [key]: value } });
  };

  const hasOptions = ['dropdown', 'multi-select', 'radio', 'checkbox'].includes(field.type);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Field Properties</h3>
          <span className="text-[10px] font-semibold text-[var(--primary)] uppercase">{field.type}</span>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--card-hover)]" style={{ color: 'var(--foreground-muted)' }}>
          <X size={14} />
        </button>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Column Width</label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[var(--background-secondary)] border" style={{ borderColor: 'var(--border)' }}>
          {[
            { key: 'full', label: '100% Full' },
            { key: 'half', label: '50% Half' },
            { key: 'third', label: '33% Third' },
          ].map((w) => (
            <button
              key={w.key}
              onClick={() => updateStyle('width', w.key)}
              className={cn(
                'py-1.5 rounded-lg text-xs font-semibold transition-all',
                (field.style?.width || 'full') === w.key ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--foreground-muted)] hover:bg-[var(--card)]',
              )}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Field Label</label>
        <input
          value={field.label}
          onChange={(e) => update('label', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none font-medium"
          style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      {!['heading', 'divider', 'hidden'].includes(field.type) && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Placeholder</label>
          <input
            value={field.placeholder ?? ''}
            onChange={(e) => update('placeholder', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Help Description</label>
        <input
          value={field.description ?? ''}
          onChange={(e) => update('description', e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
          style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      {hasOptions && (
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Options List</label>
          {(field.options ?? []).map((opt, i) => (
            <div key={opt.id} className="flex gap-2">
              <input
                value={opt.label}
                onChange={(e) => {
                  const updated = [...(field.options ?? [])];
                  updated[i] = { ...opt, label: e.target.value, value: e.target.value };
                  update('options', updated);
                }}
                className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              />
              <button
                onClick={() => update('options', (field.options ?? []).filter((_, idx) => idx !== i))}
                className="w-7 h-7 rounded flex items-center justify-center hover:bg-red-500/10"
                style={{ color: 'var(--destructive)' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newOpt = { id: generateId(), label: `Option ${(field.options?.length ?? 0) + 1}`, value: `Option ${(field.options?.length ?? 0) + 1}` };
              update('options', [...(field.options ?? []), newOpt]);
            }}
            className="w-full text-xs font-semibold flex items-center justify-center gap-1 py-2 rounded-xl border border-dashed"
            style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
          >
            <Plus size={12} /> Add New Option
          </button>
        </div>
      )}

      <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>Validation Rules</h4>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={field.validation?.required ?? false}
            onChange={(e) => updateValidation('required', e.target.checked)}
            className="w-4 h-4 accent-[var(--primary)]"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Required Field</span>
        </label>
      </div>
    </div>
  );
}

// ─── Main Visual Builder Page ─────────────────────────────────────────────────

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const formId = params.formId as string;

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'field' | 'theme'>('field');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  // Fetch form data
  const { data, isLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      const res = await fetch(`/api/forms/${formId}`);
      return res.json();
    },
  });

  const form = data?.data;
  const [localSchema, setLocalSchema] = useState<FormSchema | null>(null);
  const [status, setStatus] = useState<string>('DRAFT');

  useEffect(() => {
    if (form) {
      if (form.formSchema && !localSchema) {
        setLocalSchema(form.formSchema);
      }
      setStatus(form.status || 'DRAFT');
    }
  }, [form, localSchema]);

  const fields = localSchema?.pages?.[0]?.fields ?? [];
  const theme: FormTheme = localSchema?.theme || {
    primaryColor: '#7c3aed',
    secondaryColor: '#6d28d9',
    backgroundColor: '#f4f4f5',
    inputBg: '#ffffff',
    textColor: '#09090b',
    borderRadius: '16px',
    fontFamily: 'Inter',
    fontSize: '15px',
    inputBorder: '#e4e4e7',
    buttonBg: '#7c3aed',
    buttonText: '#ffffff',
  };

  const setFields = useCallback((newFields: FormField[] | ((prev: FormField[]) => FormField[])) => {
    setLocalSchema((prev) => {
      if (!prev) return prev;
      const updatedFields = typeof newFields === 'function' ? newFields(prev.pages[0]?.fields ?? []) : newFields;
      return {
        ...prev,
        pages: [{ ...prev.pages[0], fields: updatedFields }],
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  const setTheme = useCallback((newTheme: FormTheme) => {
    setLocalSchema((prev) => {
      if (!prev) return prev;
      return { ...prev, theme: newTheme };
    });
    setHasUnsavedChanges(true);
  }, []);

  const updateFormHeader = useCallback((newTitle: string, newDescription: string) => {
    setLocalSchema((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        title: newTitle,
        description: newDescription,
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save & Publish mutations
  const saveMutation = useMutation({
    mutationFn: async (newStatus?: string) => {
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formSchema: localSchema,
          title: localSchema?.title,
          description: localSchema?.description,
          ...(newStatus ? { status: newStatus } : {}),
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: (resData) => {
      setHasUnsavedChanges(false);
      if (resData?.data?.status) setStatus(resData.data.status);
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
      toast.success('Form and theme saved!');
    },
    onError: () => toast.error('Failed to save form'),
  });

  const handlePublish = async () => {
    await saveMutation.mutateAsync('PUBLISHED');
    setShowPublishModal(true);
    toast.success('Form published & live!');
  };

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${form?.slug}` : '';
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFields((prev) => {
      const oldIndex = prev.findIndex((f) => f.id === active.id);
      const newIndex = prev.findIndex((f) => f.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const addField = (typeInfo: FieldTypeInfo) => {
    const newField: FormField = {
      id: generateId(),
      type: typeInfo.type,
      label: typeInfo.label,
      placeholder: '',
      style: { width: typeInfo.defaultWidth || 'full' },
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
    setActiveRightTab('field');
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const duplicateField = (id: string) => {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === id);
      if (idx === -1) return prev;
      const clone = { ...prev[idx], id: generateId(), label: `${prev[idx].label} (Copy)` };
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
  };

  const updateField = (updated: FormField) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) ?? null;

  const categories = FIELD_TYPES.reduce((acc, ft) => {
    if (!acc[ft.category]) acc[ft.category] = [];
    acc[ft.category].push(ft);
    return acc;
  }, {} as Record<string, FieldTypeInfo[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
    );
  }

  const previewWidth = previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px';

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--background-secondary)' }}>
      {/* Top Header */}
      <div
        className="h-14 flex items-center justify-between px-4 flex-shrink-0 border-b z-20"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/forms')}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--card-hover)] transition-colors"
            style={{ color: 'var(--foreground-muted)' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0 flex items-center gap-2">
            <h2 className="text-sm font-bold truncate" style={{ color: 'var(--foreground)' }}>
              {localSchema?.title || form?.title || 'Visual Form Builder'}
            </h2>
            <span
              className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full')}
              style={{
                background: status === 'PUBLISHED' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                color: status === 'PUBLISHED' ? '#22c55e' : '#f59e0b',
              }}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Frames */}
          <div className="hidden md:flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--background-secondary)' }}>
            {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([device, Icon]) => (
              <button
                key={device}
                onClick={() => { setPreviewDevice(device); setShowPreview(true); }}
                className={cn('w-7 h-7 rounded-md flex items-center justify-center transition-all', previewDevice === device && showPreview && 'shadow-sm')}
                style={previewDevice === device && showPreview ? { background: 'var(--card)', color: 'var(--primary)' } : { color: 'var(--foreground-muted)' }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* Interactive Live Preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            style={showPreview ? { background: 'var(--primary)', color: 'white' } : { background: 'var(--background-secondary)', color: 'var(--foreground-muted)' }}
          >
            <Eye size={13} /> {showPreview ? 'Edit Canvas' : 'Live Preview'}
          </button>

          {/* Save Draft */}
          <button
            onClick={() => saveMutation.mutate(undefined)}
            disabled={saveMutation.isPending}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:bg-[var(--card-hover)] flex items-center gap-1.5"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            {saveMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save
          </button>

          {/* Publish & Share Button */}
          <button
            onClick={status === 'PUBLISHED' ? () => setShowPublishModal(true) : handlePublish}
            disabled={saveMutation.isPending}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-sm hover:brightness-110"
            style={{ background: 'var(--primary)' }}
          >
            <Globe2 size={13} /> {status === 'PUBLISHED' ? 'Share & Embed' : 'Publish Form'}
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Component Library */}
        {!showPreview && (
          <div
            className="w-64 flex-shrink-0 border-r overflow-y-auto p-3 space-y-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="px-1 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                Components
              </h3>
              <span className="text-[10px]" style={{ color: 'var(--foreground-subtle)' }}>Click to add</span>
            </div>

            {Object.entries(categories).map(([cat, types]) => (
              <div key={cat} className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider px-1" style={{ color: 'var(--foreground-subtle)' }}>
                  {cat}
                </p>
                {types.map((ft) => (
                  <button
                    key={ft.type}
                    onClick={() => addField(ft)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--card-hover)] border border-transparent hover:border-[var(--border)] text-left"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <span style={{ color: 'var(--primary)' }}>{ft.icon}</span>
                    {ft.label}
                    <Plus size={12} className="ml-auto opacity-40" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Center: Live Dynamic Canvas */}
        <div
          className="flex-1 overflow-y-auto p-6 flex flex-col items-center transition-colors duration-200"
          style={{ background: theme.backgroundColor || '#f4f4f5' }}
        >
          <div className="w-full max-w-3xl transition-all duration-300" style={{ maxWidth: previewWidth }}>
            {/* Visual Paper Sheet with Custom Theme Styles */}
            <div
              className="border p-8 shadow-md space-y-6 min-h-[600px] transition-all duration-200"
              style={{
                background: theme.inputBg || '#ffffff',
                borderColor: 'var(--border)',
                borderRadius: theme.borderRadius || '16px',
              }}
            >
              {/* Form Title & Description (Inline Editable) */}
              <div className="border-b pb-4 space-y-2" style={{ borderColor: 'var(--border)' }}>
                {showPreview ? (
                  <>
                    <h1 className="text-2xl font-bold" style={{ color: theme.textColor || '#09090b' }}>
                      {localSchema?.title || form?.title || 'Untitled Form'}
                    </h1>
                    {(localSchema?.description || form?.description) && (
                      <p className="text-sm opacity-75" style={{ color: theme.textColor || '#09090b' }}>
                        {localSchema?.description || form?.description}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={localSchema?.title ?? form?.title ?? ''}
                      onChange={(e) => updateFormHeader(e.target.value, localSchema?.description ?? form?.description ?? '')}
                      placeholder="Form Title..."
                      className="w-full text-2xl font-bold bg-transparent outline-none border-b border-transparent hover:border-zinc-300 focus:border-[var(--primary)] transition-all"
                      style={{ color: theme.textColor || '#09090b' }}
                    />
                    <input
                      type="text"
                      value={localSchema?.description ?? form?.description ?? ''}
                      onChange={(e) => updateFormHeader(localSchema?.title ?? form?.title ?? '', e.target.value)}
                      placeholder="Add form description..."
                      className="w-full text-sm opacity-75 bg-transparent outline-none border-b border-transparent hover:border-zinc-300 focus:border-[var(--primary)] transition-all"
                      style={{ color: theme.textColor || '#09090b' }}
                    />
                  </>
                )}
              </div>

              {/* Canvas Items */}
              {fields.length === 0 ? (
                <div className="border-2 border-dashed rounded-2xl p-16 text-center space-y-3" style={{ borderColor: 'var(--border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto" style={{ background: 'rgba(124,58,237,0.1)' }}>
                    <Layout size={22} style={{ color: theme.primaryColor || 'var(--primary)' }} />
                  </div>
                  <h3 className="text-base font-bold" style={{ color: theme.textColor || '#09090b' }}>Your Canvas is Empty</h3>
                  <p className="text-xs opacity-70" style={{ color: theme.textColor || '#09090b' }}>
                    Click components from the left panel to add fields to your form.
                  </p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields.map((f) => f.id)} strategy={rectSortingStrategy}>
                    <div className="flex flex-wrap gap-4 items-start">
                      {fields.map((field) => (
                        <VisualCanvasField
                          key={field.id}
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          theme={theme}
                          onSelect={() => { setSelectedFieldId(field.id); setActiveRightTab('field'); }}
                          onDelete={() => deleteField(field.id)}
                          onDuplicate={() => duplicateField(field.id)}
                          onWidthChange={(w) => updateField({ ...field, style: { ...field.style, width: w } })}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Submit Button */}
              {fields.length > 0 && (
                <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    disabled={!showPreview}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer active:scale-[0.99]"
                    style={{
                      background: theme.primaryColor || 'var(--primary)',
                      borderRadius: theme.borderRadius || '16px',
                    }}
                  >
                    {localSchema?.settings?.submitButtonText || 'Submit Form'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar with Tabs (Dark Mode Compatible) */}
        {!showPreview && (
          <div
            className="w-72 flex-shrink-0 border-l flex flex-col overflow-hidden"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            {/* Tab Header */}
            <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setActiveRightTab('field')}
                className={cn(
                  'flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2',
                  activeRightTab === 'field' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--background-secondary)]' : 'border-transparent text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]',
                )}
              >
                <Layout size={13} /> Field
              </button>
              <button
                onClick={() => setActiveRightTab('theme')}
                className={cn(
                  'flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2',
                  activeRightTab === 'theme' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--background-secondary)]' : 'border-transparent text-[var(--foreground-muted)] hover:bg-[var(--card-hover)]',
                )}
              >
                <Palette size={13} /> Theme
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeRightTab === 'field' ? (
                <PropertiesPanel
                  field={selectedField}
                  schema={localSchema}
                  onChange={updateField}
                  onUpdateFormHeader={updateFormHeader}
                  onClose={() => setSelectedFieldId(null)}
                />
              ) : (
                <ThemeEditor
                  theme={theme}
                  onChangeTheme={setTheme}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Publish & Share Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Globe2 size={18} style={{ color: 'var(--primary)' }} />
                <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Form Published! 🎉</h3>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--card-hover)]" style={{ color: 'var(--foreground-muted)' }}>
                <X size={16} />
              </button>
            </div>

            {/* Public Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>Direct Share Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none"
                  style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl);
                    setCopiedLink(true);
                    toast.success('Link copied to clipboard!');
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1"
                  style={{ background: 'var(--primary)' }}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />} Copy
                </button>
              </div>
            </div>

            {/* Embed Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--foreground-muted)' }}>
                <Code2 size={13} /> Embed Code (Iframe)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={embedCode}
                  className="flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none truncate"
                  style={{ background: 'var(--background-secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(embedCode);
                    setCopiedEmbed(true);
                    toast.success('Embed code copied!');
                    setTimeout(() => setCopiedEmbed(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {copiedEmbed ? <Check size={14} /> : <Copy size={14} />} Copy
                </button>
              </div>
            </div>

            {/* Open Form in New Tab */}
            <div className="pt-2">
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 hover:bg-[var(--card-hover)]"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Open Live Public Form <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/mongodb/client';
import { Form } from '@/lib/mongodb/models/form.model';
import { PromptHistory } from '@/lib/mongodb/models/prompt-history.model';
import { ActivityLog } from '@/lib/mongodb/models/activity-log.model';
import { checkMonthlyFormLimit, getCurrentMonthKey } from '@/lib/form-limit';
import { geminiFlashStructured } from '@/lib/gemini';
import { generateFormSlug, generateId } from '@/lib/utils';
import type { FormSchema, FormTheme, FormSettings, FormField } from '@/types/form';

const RequestSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters').max(2000),
  existingFormId: z.string().optional(), // If editing an existing form with AI
});

const SYSTEM_PROMPT = `You are Prompt2Form AI. Generate complete form JSON schemas.
RULES:
1. Return ONLY valid JSON matching FormSchema. No markdown, no wrappers.
2. FieldTypes: text, paragraph, email, phone, number, url, date, time, datetime, dropdown, multi-select, radio, checkbox, rating, slider, file-upload, signature, address, country, heading, divider, hidden, page-break.
3. Use 12-char alphanumeric strings for IDs.

Schema:
{
  "version": "1.0",
  "title": string,
  "description": string,
  "pages": [{
    "id": string,
    "title": string,
    "fields": [{
      "id": string,
      "type": string,
      "label": string,
      "placeholder": string,
      "options": [{"id": string, "label": string, "value": string}],
      "validation": {"required": boolean}
    }]
  }],
  "multiStep": false,
  "theme": {
    "primaryColor": "#7c3aed",
    "secondaryColor": "#6d28d9",
    "backgroundColor": "#ffffff",
    "textColor": "#09090b",
    "borderRadius": "8px",
    "fontFamily": "Inter, sans-serif",
    "fontSize": "15px",
    "inputBg": "#fafafa",
    "inputBorder": "#e4e4e7",
    "buttonBg": "#7c3aed",
    "buttonText": "#ffffff",
    "animation": "fade",
    "spacing": "comfortable"
  },
  "settings": {
    "submitButtonText": "Submit",
    "successMessage": "Thank you! Response recorded.",
    "progressBar": false
  }
}`;

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.issues[0].message }), { status: 400 });
  }

  const { prompt, existingFormId } = parsed.data;

  await connectDB();

  // Enforce limit only if creating a NEW form (not editing)
  if (!existingFormId) {
    const limit = await checkMonthlyFormLimit(user.id);
    if (!limit.allowed) {
      return new Response(
        JSON.stringify({
          error: `Monthly limit reached: ${limit.limit} forms. Resets on ${limit.resetDate}.`,
          code: 'FORM_LIMIT_EXCEEDED',
          limit,
        }),
        { status: 429 },
      );
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send({ type: 'status', message: 'Analyzing your prompt...' });

        const fullPrompt = `${SYSTEM_PROMPT}\n\nUser request: "${prompt}"\n\nGenerate the form schema now:`;

        send({ type: 'status', message: 'Generating form structure with AI...' });

        const result = await geminiFlashStructured.generateContent(fullPrompt);
        const text = result.response.text();

        send({ type: 'status', message: 'Parsing and validating form...' });

        let formSchema: FormSchema;
        try {
          formSchema = JSON.parse(text);
        } catch {
          // Gemini sometimes wraps in ```json even with responseMimeType — strip it
          const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          formSchema = JSON.parse(cleaned);
        }

        // Ensure metadata
        formSchema.metadata = { ...formSchema.metadata, generatedBy: 'ai', prompt };

        // Ensure all IDs are set
        formSchema.pages = formSchema.pages.map((page) => ({
          ...page,
          id: page.id || generateId(),
          fields: (page.fields || []).map((field: FormField) => ({
            ...field,
            id: field.id || generateId(),
            options: field.options?.map((opt) => ({
              ...opt,
              id: opt.id || generateId(),
            })),
          })),
        }));

        send({ type: 'status', message: 'Saving your form...' });

        let form;
        if (existingFormId) {
          // Edit existing form
          form = await Form.findOneAndUpdate(
            { _id: existingFormId, userId: user.id },
            {
              title: formSchema.title,
              description: formSchema.description,
              formSchema,
              updatedAt: new Date(),
            },
            { new: true },
          );
          if (!form) {
            send({ type: 'error', message: 'Form not found or access denied.' });
            controller.close();
            return;
          }
        } else {
          // Create new form
          form = await Form.create({
            userId: user.id,
            title: formSchema.title,
            description: formSchema.description,
            slug: generateFormSlug(formSchema.title),
            formSchema,
            monthCreated: getCurrentMonthKey(),
          });
        }

        // Save prompt history
        await PromptHistory.create({
          userId: user.id,
          formId: form._id,
          prompt,
          type: 'GENERATE',
          result: formSchema,
        });

        // Log activity
        await ActivityLog.create({
          userId: user.id,
          action: existingFormId ? 'form.updated' : 'form.created',
          entityId: form._id,
          entity: 'Form',
          metadata: { description: `${existingFormId ? 'Updated' : 'Created'} form "${formSchema.title}" with AI` },
        });

        send({ type: 'complete', formId: form._id.toString(), form: form.toObject() });

      } catch (error: unknown) {
        console.error('[AI Generate] Error:', error);

        // Parse Gemini-specific error status codes
        const geminiError = error as { status?: number; message?: string };
        const status = geminiError?.status;

        if (status === 429) {
          // Extract retry delay if available
          send({
            type: 'error',
            message: 'AI service is busy right now (rate limit). Please wait a few seconds and try again.',
            code: 'RATE_LIMIT',
          });
        } else if (status === 400) {
          send({
            type: 'error',
            message: 'Your prompt was rejected by the AI. Try rephrasing it.',
            code: 'INVALID_PROMPT',
          });
        } else if (status === 403) {
          send({
            type: 'error',
            message: 'AI service authentication failed. Please contact support.',
            code: 'AUTH_ERROR',
          });
        } else if (geminiError?.message?.includes('JSON')) {
          send({
            type: 'error',
            message: 'AI returned an unexpected response. Please try again with a more specific prompt.',
            code: 'PARSE_ERROR',
          });
        } else {
          send({
            type: 'error',
            message: 'Failed to generate form. Please try again.',
            code: 'UNKNOWN_ERROR',
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

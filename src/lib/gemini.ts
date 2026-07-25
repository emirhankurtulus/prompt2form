import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('[Gemini] GEMINI_API_KEY is not set. AI features will not work.');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export const geminiFlash = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

/** Streaming model for form generation (lower temp for structured JSON) */
export const geminiFlashStructured = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
  generationConfig: {
    temperature: 0.3,
    topP: 0.9,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  },
});

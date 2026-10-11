import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from server/.env if present
dotenv.config();

const app = express();

// Configuration
const PORT = process.env.PORT || 3001;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_TEXT_LENGTH = 10000;

// Configurable CORS origins (supports single or comma-separated origins, strips trailing slashes)
const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = rawFrontendUrl
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Ensure local development origin is always supported
if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}

const ALLOWED_ACTIONS = ['summarize', 'keyPoints', 'improveWriting'];

// Action prompt builders
const PROMPTS = {
  summarize: (text) =>
    `You are an expert editor. Provide a clear, concise, and well-structured summary of the following text. Capture the essential ideas, main arguments, and key context without unnecessary filler:\n\n${text}`,

  keyPoints: (text) =>
    `You are an expert analyst. Extract the most important key points and actionable takeaways from the following text as a clean, bulleted list. Focus on high-impact insights:\n\n${text}`,

  improveWriting: (text) =>
    `You are an expert writing coach and editor. Polish and improve the following text for clarity, conciseness, flow, and grammatical correctness while preserving the author's original meaning and intent:\n\n${text}`,
};

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, health checks)
      if (!origin) return callback(null, true);

      const normalized = origin.trim().replace(/\/+$/, '');
      // Allow configured origins, localhost, or any Vercel domain
      if (
        allowedOrigins.includes(normalized) ||
        normalized.endsWith('.vercel.app') ||
        /^https:\/\/.*\.vercel\.app$/.test(normalized)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '1mb' }));

// Gracefully handle malformed JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload in request body.' });
  }
  next(err);
});

// Health check endpoint - returns status without exposing secrets or env values
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// AI generation endpoint
app.post('/api/generate', async (req, res) => {
  const { text, action } = req.body || {};

  // Validate action
  if (!action || typeof action !== 'string' || !ALLOWED_ACTIONS.includes(action)) {
    return res.status(400).json({
      error: `Invalid action. Supported actions are: ${ALLOWED_ACTIONS.join(', ')}.`,
    });
  }

  // Validate text existence and type
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      error: 'The "text" field is required and must be non-empty text.',
    });
  }

  // Validate input length
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({
      error: `Input exceeds the maximum allowed length of ${MAX_TEXT_LENGTH} characters.`,
    });
  }

  // Verify API key configuration
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'replace_with_your_key' || !apiKey.trim()) {
    return res.status(500).json({
      error: 'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in server/.env.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = PROMPTS[action](text.trim());

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const result = response?.text?.trim() || '';

    if (!result) {
      return res.status(502).json({
        error: 'The AI model returned an empty response. Please try again.',
      });
    }

    return res.json({ result });
  } catch (error) {
    // Log safe server-side diagnostics without printing raw sensitive details
    console.error('Gemini API call failed:', error?.message || 'Unknown error');

    return res.status(500).json({
      error: 'Failed to generate response with AI. Please verify your API key or try again later.',
    });
  }
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err?.message || 'Unknown error');
  res.status(500).json({ error: 'Internal server error.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`SmartNotes backend running on http://localhost:${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});

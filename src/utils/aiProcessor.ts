export type AIAction = 'summarize' | 'keyPoints' | 'improveWriting';

export interface AIResult {
  summary: string;
  keyPoints: string[];
  improved: string;
}

// Configurable API base URL for deployment (defaults to local development port 3001)
const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

/**
 * Parses Gemini bullet points or multiline text into a clean array of strings.
 */
function parseKeyPoints(rawText: string): string[] {
  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const points = lines
    .map(line => line.replace(/^([-*•]|\d+[.)])\s*/, '').trim())
    .filter(line => line.length > 0);

  return points.length > 0 ? points : [rawText.trim()];
}

/**
 * Sends a real generation request to the local Express backend (http://localhost:3001/api/generate).
 */
export async function processWithAI(text: string, action: AIAction): Promise<Partial<AIResult>> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Please enter some text first.');
  }

  const controller = new AbortController();
  // 90s timeout to allow Render free tier instances to spin up from sleep
  const timeoutId = setTimeout(() => controller.abort(), 90000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: trimmed,
        action,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Server returned status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        if (response.statusText) {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data || typeof data.result !== 'string') {
      throw new Error('Received an unexpected response format from the server.');
    }

    switch (action) {
      case 'summarize':
        return { summary: data.result };
      case 'keyPoints':
        return { keyPoints: parseKeyPoints(data.result) };
      case 'improveWriting':
        return { improved: data.result };
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(
        'Request timed out. If the backend is waking up from sleep (Render free tier), please wait 15 seconds and try again.'
      );
    }

    // Network / server connection failure
    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      throw new Error(
        `Backend server is unavailable. Please verify the server is running at ${API_BASE_URL}.`
      );
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred while communicating with the server.');
  }
}

/**
 * Runs all actions in parallel for full processing.
 */
export async function processAll(text: string): Promise<AIResult> {
  const [summaryRes, keyPointsRes, improvedRes] = await Promise.all([
    processWithAI(text, 'summarize'),
    processWithAI(text, 'keyPoints'),
    processWithAI(text, 'improveWriting'),
  ]);

  return {
    summary: summaryRes.summary || '',
    keyPoints: keyPointsRes.keyPoints || [],
    improved: improvedRes.improved || '',
  };
}

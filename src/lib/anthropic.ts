import Groq from 'groq-sdk';

let client: Groq | null = null;

export function getClient(): Groq {
  if (!client) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing VITE_GROQ_API_KEY. Add it to your .env.local file.',
      );
    }
    client = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

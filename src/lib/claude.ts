import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing VITE_ANTHROPIC_API_KEY. Add it to your .env.local file.',
      );
    }
    client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

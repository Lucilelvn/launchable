import { useState, useCallback } from 'react';
import { getClient } from '../lib/groq';
import { ASSESS_SYSTEM_PROMPT } from '../lib/prompts';
import { incrementUsage } from '../lib/usage';
import type { Assessment, IdeaInput } from '../types';

export function useAssessIdea() {
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assess = useCallback(async (input: IdeaInput) => {
    setIsLoading(true);
    setError(null);
    setAssessment(null);

    const parts = [`Idea: ${input.concept}`];
    if (input.audience) parts.push(`Target audience: ${input.audience}`);
    if (input.timeline) parts.push(`Timeline: ${input.timeline}`);
    const userMessage = parts.join('\n');

    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2048,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ASSESS_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      });

      const text = response.choices[0]?.message?.content ?? '';
      const parsed = JSON.parse(text) as Assessment;
      setAssessment(parsed);
      incrementUsage();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, assessment, error, assess };
}

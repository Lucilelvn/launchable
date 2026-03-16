import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getAnthropicClient } from '../lib/claude';
import { ASSESS_SYSTEM_PROMPT } from '../lib/prompts';
import { IS_MOCK, mockAssess } from '../lib/mock';
import { IS_LOCAL_LLM, localAssess } from '../lib/local-llm';
import type { Assessment, IdeaInput } from '../types';

export function useAssessIdea() {
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const incrementUsage = useMutation(api.usage.increment);

  const assess = useCallback(async (input: IdeaInput) => {
    setIsLoading(true);
    setError(null);
    setAssessment(null);

    const parts = [`Idea: ${input.concept}`];
    if (input.audience) parts.push(`Target audience: ${input.audience}`);
    if (input.timeline) parts.push(`Timeline: ${input.timeline}`);
    const userMessage = parts.join('\n');

    try {
      if (IS_MOCK) {
        const parsed = await mockAssess();
        setAssessment(parsed);
        void incrementUsage();
        return;
      }

      let text: string;

      if (IS_LOCAL_LLM) {
        text = await localAssess(userMessage, ASSESS_SYSTEM_PROMPT);
      } else {
        const client = getAnthropicClient();
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: ASSESS_SYSTEM_PROMPT,
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
          messages: [{ role: 'user', content: userMessage }],
        });

        // Find the last text block (after web search tool use)
        const textBlocks = response.content.filter((b) => b.type === 'text');
        const lastText = textBlocks[textBlocks.length - 1];
        text = lastText && 'text' in lastText ? lastText.text : '';
      }

      // Extract JSON from the response (may be wrapped in markdown fences)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as Assessment;
      setAssessment(parsed);
      void incrementUsage();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  }, [incrementUsage]);

  return { isLoading, assessment, error, assess };
}

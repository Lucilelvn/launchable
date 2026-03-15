import { useState, useCallback } from 'react';
import { getAnthropicClient } from '../lib/claude';
import { REFINE_SYSTEM_PROMPT } from '../lib/prompts';
import { IS_MOCK, mockRefine } from '../lib/mock';
import type { Assessment, Refinement } from '../types';

export function useRefineIdea() {
  const [isLoading, setIsLoading] = useState(false);
  const [refinement, setRefinement] = useState<Refinement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refine = useCallback(async (concept: string, audience: string | undefined, assessment: Assessment) => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_MOCK) {
        const parsed = await mockRefine();
        setRefinement(parsed);
        return;
      }

      const parts = [
        `Idea: ${concept}`,
        `Verdict: ${assessment.verdict}`,
        `Demand: ${assessment.demand.score}/10 — ${assessment.demand.summary}`,
        `Competition: ${assessment.competition.score}/10 — ${assessment.competition.summary}`,
        `Shippability: ${assessment.shippability.score}/10 — ${assessment.shippability.summary}`,
      ];
      if (audience) parts.push(`Target audience: ${audience}`);

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: REFINE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: parts.join('\n') }],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock && 'text' in textBlock ? textBlock.text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]) as Refinement;
      parsed.features = parsed.features.map((f) => ({ ...f, accepted: true }));
      setRefinement(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, refinement, setRefinement, error, refine };
}

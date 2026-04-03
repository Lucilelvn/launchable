import { useState, useCallback } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { REFINE_SYSTEM_PROMPT } from '../lib/prompts';
import { IS_MOCK, mockRefine } from '../lib/mock';
import { IS_LOCAL_LLM, localRefine } from '../lib/local-llm';
import type { Assessment, Refinement } from '../types';

export function useRefineIdea() {
  const [isLoading, setIsLoading] = useState(false);
  const [refinement, setRefinement] = useState<Refinement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refineAction = useAction(api.ai.refine);

  const refine = useCallback(async (concept: string, audience: string | undefined, assessment: Assessment) => {
    setIsLoading(true);
    setError(null);

    try {
      if (IS_MOCK) {
        const parsed = await mockRefine();
        setRefinement(parsed);
        return;
      }

      if (IS_LOCAL_LLM) {
        const parts = [
          `Idea: ${concept}`,
          `Verdict: ${assessment.verdict}`,
          `Demand: ${assessment.demand.score}/10 — ${assessment.demand.summary}`,
          `Competition: ${assessment.competition.score}/10 — ${assessment.competition.summary}`,
          `Shippability: ${assessment.shippability.score}/10 — ${assessment.shippability.summary}`,
        ];
        if (audience) parts.push(`Target audience: ${audience}`);

        const text = await localRefine(parts.join('\n'), REFINE_SYSTEM_PROMPT);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No valid JSON found in response');

        const parsed = JSON.parse(jsonMatch[0]) as Refinement;
        parsed.features = parsed.features.map((f) => ({ ...f, accepted: true }));
        setRefinement(parsed);
        return;
      }

      // Production: use server-side Convex action
      const parsed = await refineAction({
        concept,
        audience,
        verdict: assessment.verdict,
        demandScore: assessment.demand.score,
        demandSummary: assessment.demand.summary,
        competitionScore: assessment.competition.score,
        competitionSummary: assessment.competition.summary,
        shippabilityScore: assessment.shippability.score,
        shippabilitySummary: assessment.shippability.summary,
      }) as Refinement;
      setRefinement(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [refineAction]);

  return { isLoading, refinement, setRefinement, error, refine };
}

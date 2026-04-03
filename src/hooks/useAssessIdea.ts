import { useState, useCallback } from 'react';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ASSESS_SYSTEM_PROMPT } from '../lib/prompts';
import { IS_MOCK, mockAssess } from '../lib/mock';
import { IS_LOCAL_LLM, localAssess } from '../lib/local-llm';
import type { Assessment, IdeaInput } from '../types';

export function useAssessIdea() {
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const incrementUsage = useMutation(api.usage.increment);
  const assessAction = useAction(api.ai.assess);

  const assess = useCallback(async (input: IdeaInput) => {
    setIsLoading(true);
    setError(null);
    setAssessment(null);

    try {
      if (IS_MOCK) {
        const parsed = await mockAssess();
        setAssessment(parsed);
        void incrementUsage();
        return;
      }

      if (IS_LOCAL_LLM) {
        const parts = [`Idea: ${input.concept}`];
        if (input.audience) parts.push(`Target audience: ${input.audience}`);
        if (input.timeline) parts.push(`Timeline: ${input.timeline}`);
        const userMessage = parts.join('\n');

        const text = await localAssess(userMessage, ASSESS_SYSTEM_PROMPT);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No valid JSON found in response');

        const parsed = JSON.parse(jsonMatch[0]) as Assessment;
        setAssessment(parsed);
        void incrementUsage();
        return;
      }

      // Production: use server-side Convex action
      const parsed = await assessAction({
        concept: input.concept,
        audience: input.audience,
        timeline: input.timeline,
      }) as Assessment;
      setAssessment(parsed);
      // Usage is incremented server-side by the action
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong',
      );
    } finally {
      setIsLoading(false);
    }
  }, [incrementUsage, assessAction]);

  return { isLoading, assessment, error, assess };
}

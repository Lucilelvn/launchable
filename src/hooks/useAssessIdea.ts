import { useState, useCallback } from 'react';
import { getAnthropicClient } from '../lib/claude';
import { researchIdea } from '../lib/search';
import { ASSESS_SYSTEM_PROMPT, formatAssessmentMessage } from '../lib/prompts';
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

    try {
      // Step 1: Web research (demand + competition in parallel)
      const research = await researchIdea(input.concept, input.audience);

      // Step 2: Score with Claude, passing search evidence
      const userMessage = formatAssessmentMessage(
        input.concept,
        input.audience,
        input.timeline,
        research,
      );

      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: ASSESS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock && 'text' in textBlock ? textBlock.text : '';
      const parsed = JSON.parse(text) as Assessment;

      // Attach raw research to the assessment
      parsed.web_research = research;

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

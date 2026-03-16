const PROXY_URL = '/api/llm';

export const IS_LOCAL_LLM = import.meta.env.VITE_LOCAL_LLM === 'true';

interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
}

async function callLocalLLM(req: LLMRequest): Promise<string> {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Proxy returned ${res.status}`);
  }

  const data = await res.json();
  return data.result;
}

export async function localAssess(userMessage: string, systemPrompt: string): Promise<string> {
  // Strip web search instructions since the CLI doesn't have web_search tool.
  // Tell it to use its training knowledge instead.
  const localPrompt = systemPrompt
    .replace(/You have access to web search\.\s*/g, '')
    .replace(/You MUST search the web before scoring\. Do not skip research\./g, 'Use your training knowledge to score. No web search is available.')
    .replace(/Search the web for/g, 'Based on your knowledge, assess')
    .replace(/Each evidence array must have 2-3 items from your web research/g, 'Each evidence array must have 2-3 items based on your knowledge')
    .replace(/Demand and competition scores MUST be grounded in search evidence, not intuition/g, 'Demand and competition scores should be grounded in your knowledge of the market')
    .replace(/If search results are thin or inconclusive, say so honestly/g, 'If your knowledge is limited, say so honestly');

  return callLocalLLM({ prompt: userMessage, systemPrompt: localPrompt, jsonMode: true });
}

export async function localRefine(userMessage: string, systemPrompt: string): Promise<string> {
  return callLocalLLM({ prompt: userMessage, systemPrompt, jsonMode: true });
}

export async function localBuildPrompt(userMessage: string, systemPrompt: string): Promise<string> {
  return callLocalLLM({ prompt: userMessage, systemPrompt, jsonMode: true });
}

export async function localGenerateTitle(concept: string): Promise<string> {
  return callLocalLLM({
    prompt: `Summarize this product idea into exactly 3-5 words as a short catchy title. No quotes, no punctuation, no explanation — just the title.\n\nIdea: ${concept}`,
  });
}

export async function localGenerateConcept(userMessage: string, systemPrompt: string): Promise<string> {
  return callLocalLLM({ prompt: userMessage, systemPrompt, jsonMode: true });
}

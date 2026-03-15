import type { SearchResult, WebResearchResults } from '../types';

const GOOGLE_SEARCH_URL = 'https://www.googleapis.com/customsearch/v1';

async function searchWeb(query: string): Promise<SearchResult[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
  const engineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !engineId) {
    throw new Error(
      'Missing VITE_GOOGLE_SEARCH_API_KEY or VITE_GOOGLE_SEARCH_ENGINE_ID. Add them to your .env.local file.',
    );
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: engineId,
    q: query,
    num: '5',
  });

  const response = await fetch(`${GOOGLE_SEARCH_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Search API error: ${response.status}`);
  }

  const data = await response.json();
  const items = data.items ?? [];

  return items.map((item: { title: string; link: string; snippet: string }) => ({
    title: item.title,
    url: item.link,
    snippet: item.snippet,
  }));
}

export async function researchIdea(concept: string, audience?: string): Promise<WebResearchResults> {
  const audienceClause = audience ? ` for ${audience}` : '';

  const [demand, competition] = await Promise.all([
    searchWeb(`${concept}${audienceClause} problem discussion forum reddit`),
    searchWeb(`${concept}${audienceClause} existing tools products competitors`),
  ]);

  return { demand, competition };
}

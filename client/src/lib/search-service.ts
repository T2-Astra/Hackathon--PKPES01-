// Web Search Service using Serper.dev
export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export interface SearchResponse {
  results: SearchResult[];
  error?: string;
}

const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY || '';

export const searchService = {
  async search(query: string, count: number = 5): Promise<SearchResponse> {
    if (!SERPER_API_KEY) {
      return { results: [], error: 'Serper API key not configured' };
    }

    try {
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query, num: count })
      });

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const data = await response.json();
      const results: SearchResult[] = [];

      if (data.organic) {
        for (const item of data.organic.slice(0, count)) {
          results.push({
            title: item.title || 'Untitled',
            url: item.link || '',
            description: item.snippet || 'No description'
          });
        }
      }

      if (data.answerBox && results.length < count) {
        results.unshift({
          title: data.answerBox.title || 'Answer',
          url: data.answerBox.link || '',
          description: data.answerBox.snippet || data.answerBox.answer || ''
        });
      }

      return { results: results.slice(0, count) };
    } catch (error) {
      console.error('Search error:', error);
      return { results: [], error: error instanceof Error ? error.message : 'Search failed' };
    }
  },

  formatResultsForAI(results: SearchResult[]): string {
    if (results.length === 0) return '';
    return results.map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.description}`).join('\n\n');
  }
};

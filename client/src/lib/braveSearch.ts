const RAPID_API_KEY = "4f38e50ac5msh5be238230a32e10p19af10jsn298710f7c489";
const RAPID_API_HOST = "brave-web-search.p.rapidapi.com";

export interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
}

export async function searchBrave(query: string): Promise<BraveSearchResult[]> {
  try {
    const response = await fetch(
      `https://${RAPID_API_HOST}/search?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": RAPID_API_KEY,
          "x-rapidapi-host": RAPID_API_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse Brave API response - adjust based on actual API structure
    const results = data.web?.results || data.results || [];
    
    return results.slice(0, 5).map((result: any) => ({
      title: result.title || "Untitled",
      url: result.url || "",
      description: result.description || result.snippet || "No description available",
    }));
  } catch (error) {
    console.error("Brave search error:", error);
    throw error;
  }
}

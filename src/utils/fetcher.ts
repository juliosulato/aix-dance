/**
 * Generic fetcher for API requests with better error handling
 * Used primarily with SWR for data fetching
 */
export const fetcher = async <T = any>(url: string): Promise<T> => {
  try {
    const res = await fetch(url, {
      credentials: 'include', // Include cookies for authentication
    });

    if (!res.ok) {
      // Try to parse error message from response
      let errorMessage = `Erro HTTP ${res.status}: ${res.statusText}`;
      
      try {
        const errorData = await res.json();
        if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If response is not JSON, use status text
      }

      const error = new Error(errorMessage) as Error & { status?: number };
      error.status = res.status;
      throw error;
    }

    return res.json();
  } catch (error) {
    // Re-throw network errors or parsing errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro desconhecido ao buscar dados');
  }
};

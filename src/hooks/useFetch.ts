import { useState, useEffect } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for data fetching with loading and error states
 * @param fetchFn - Async function that returns data
 * @param dependencies - Optional array of dependencies
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
): FetchState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchFn();
      setState({ data, loading: false, error: null });
    } catch (error) {
      console.error("Error in useFetch:", error);

      let errorMessage = "An unknown error occurred";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = "No response from server. Please check your network connection.";
        } else {
          errorMessage = `Error: ${error.message || "Unknown error occurred"}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState({ data: null, loading: false, error: errorMessage });
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = async () => {
    await fetchData();
  };

  return { ...state, refetch };
}

// We need to import axios for type checking
import axios from "axios";

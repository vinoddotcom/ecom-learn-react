import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFetch } from "../../hooks/useFetch";
import axios from "axios";

// Mock axios for type checking in useFetch
vi.mock("axios", () => {
  return {
    default: {
      isAxiosError: vi.fn(),
    },
  };
});

describe("useFetch", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return initial loading state", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: "test" });

    const { result } = renderHook(() => useFetch(fetchFn));

    // Check initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.refetch).toBe("function");

    // Wait for any pending state updates to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("should update state with fetched data when successful", async () => {
    const testData = { success: true, message: "test" };
    const fetchFn = vi.fn().mockResolvedValue(testData);

    const { result } = renderHook(() => useFetch(fetchFn));

    // Use waitFor to handle the React act() warning
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(testData);
      expect(result.current.error).toBe(null);
    });

    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("should update state with error when fetch fails", async () => {
    const error = new Error("Network error");
    const fetchFn = vi.fn().mockRejectedValue(error);

    vi.mocked(axios.isAxiosError).mockReturnValue(false);

    const { result } = renderHook(() => useFetch(fetchFn));

    // Use waitFor to handle the React act() warning
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe("Network error");
    });
  });

  it("should handle Axios errors correctly", async () => {
    const axiosError = {
      response: {
        status: 404,
        statusText: "Not Found",
      },
      message: "Request failed with status code 404",
    };

    const fetchFn = vi.fn().mockRejectedValue(axiosError);

    // Mock isAxiosError to return true
    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    const { result } = renderHook(() => useFetch(fetchFn));

    // Use waitFor to handle the React act() warning
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe("Server error: 404 - Not Found");
    });
  });

  it("should refetch data when refetch function is called", async () => {
    const testData = { success: true, message: "test" };
    const fetchFn = vi.fn().mockResolvedValue(testData);

    const { result } = renderHook(() => useFetch(fetchFn));

    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Reset mock and trigger refetch
    fetchFn.mockClear();

    // Call refetch inside act wrapper
    act(() => {
      void result.current.refetch();
    });

    // Wait for refetch to complete
    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(testData);
    });
  });

  it("should update when dependencies change", async () => {
    const testData1 = { success: true, id: 1 };
    const testData2 = { success: true, id: 2 };

    const fetchFn = vi.fn().mockResolvedValueOnce(testData1).mockResolvedValueOnce(testData2);

    const { result, rerender } = renderHook(({ id }) => useFetch(() => fetchFn(id), [id]), {
      initialProps: { id: 1 },
    });

    // Wait for the initial fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(testData1);
    });

    // Change dependency and rerender
    rerender({ id: 2 });

    // Should trigger loading state again
    expect(result.current.loading).toBe(true);

    // Wait for second fetch to complete using waitFor to handle act() warnings
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(testData2);
    });
  });
});

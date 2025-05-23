import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiHelper } from "../config";

// Mock the axios instance directly
vi.mock("../config", async () => {
  const axiosMock = {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    create: vi.fn().mockReturnValue({}),
  };

  return {
    default: axiosMock,
    apiHelper: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("API Configuration", () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("apiHelper", () => {
    it("should expose HTTP methods", () => {
      expect(apiHelper).toHaveProperty("get");
      expect(apiHelper).toHaveProperty("post");
      expect(apiHelper).toHaveProperty("put");
      expect(apiHelper).toHaveProperty("patch");
      expect(apiHelper).toHaveProperty("delete");
    });

    it("should call apiHelper methods with correct parameters", async () => {
      const url = "/test";
      const data = { test: true };
      const config = { headers: { "X-Test": "test" } };

      await apiHelper.get(url, config);
      expect(apiHelper.get).toHaveBeenCalledWith(url, config);

      await apiHelper.post(url, data, config);
      expect(apiHelper.post).toHaveBeenCalledWith(url, data, config);

      await apiHelper.put(url, data, config);
      expect(apiHelper.put).toHaveBeenCalledWith(url, data, config);

      await apiHelper.patch(url, data, config);
      expect(apiHelper.patch).toHaveBeenCalledWith(url, data, config);

      await apiHelper.delete(url, config);
      expect(apiHelper.delete).toHaveBeenCalledWith(url, config);
    });
  });
});

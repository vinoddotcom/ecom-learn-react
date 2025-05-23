import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import { getMockProductsResponse, getMockProductResponse } from "../api/mockServer";

// Mock server setup using MSW
export const handlers = [
  // Product endpoints
  http.get("*/products", () => {
    return HttpResponse.json(getMockProductsResponse());
  }),
  http.get("*/products/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json(getMockProductResponse(id as string));
  }),
];

// Setup and tear down MSW server
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Close server after all tests
afterAll(() => server.close());

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

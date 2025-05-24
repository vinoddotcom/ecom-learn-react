import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";
import { getMockProductsResponse, getMockProductResponse } from "../api/mockServer";

// Mock auth responses
const mockAuthResponses = {
  login: {
    success: true,
    token: "test-token",
    user: {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      avatar: {
        public_id: "avatars/test",
        url: "https://example.com/avatar.jpg",
      },
    },
  },
  register: {
    success: true,
    token: "new-token",
    user: {
      _id: "newuser123",
      name: "New User",
      email: "new@example.com",
      role: "user",
    },
  },
  profile: {
    success: true,
    user: {
      _id: "user123",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      avatar: {
        public_id: "avatars/test",
        url: "https://example.com/avatar.jpg",
      },
    },
  },
  logout: {
    success: true,
    message: "Logged out successfully",
  },
};

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

  // Auth endpoints
  http.post("*/auth/login", () => {
    return HttpResponse.json(mockAuthResponses.login);
  }),
  http.post("*/auth/register", () => {
    return HttpResponse.json(mockAuthResponses.register);
  }),
  http.get("*/auth/me", () => {
    return HttpResponse.json(mockAuthResponses.profile);
  }),
  http.get("*/auth/logout", () => {
    return HttpResponse.json(mockAuthResponses.logout);
  }),
  http.put("*/auth/password/update", () => {
    return HttpResponse.json({ success: true });
  }),
  http.put("*/auth/me/update", () => {
    return HttpResponse.json({ success: true });
  }),
  http.post("*/auth/password/forgot", () => {
    return HttpResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  }),
  http.put("*/auth/password/reset/:token", () => {
    return HttpResponse.json({ success: true });
  }),
  http.get("*/auth/admin/users", () => {
    return HttpResponse.json({
      success: true,
      users: [mockAuthResponses.login.user],
      count: 1,
    });
  }),
  http.get("*/auth/admin/users/:id", () => {
    return HttpResponse.json({ success: true, user: mockAuthResponses.login.user });
  }),
  http.put("*/auth/admin/users/:id", () => {
    return HttpResponse.json({ success: true });
  }),
  http.delete("*/auth/admin/users/:id", () => {
    return HttpResponse.json({ success: true });
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

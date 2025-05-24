import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, beforeEach, vi } from "vitest";
import authReducer, {
  login,
  register,
  logout,
  getUserProfile,
  clearError,
} from "../../../src/store/slices/authSlice";
import type { User, AuthResponse } from "../../../src/api/authService";

// Mock the AuthService module
vi.mock("../../../src/api/authService", () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMyProfile: vi.fn(),
  },
}));

describe("Auth Slice", () => {
  // Using any type for store to avoid TypeScript errors with complex Redux types
  let store: any;

  beforeEach(() => {
    // Clear mock calls
    vi.clearAllMocks();

    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe("Initial state", () => {
    it("should return the initial state", () => {
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("Auth actions", () => {
    it("should handle login.pending", () => {
      store.dispatch({ type: login.pending.type });
      const state = store.getState().auth;

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should handle login.fulfilled", () => {
      const mockUser: User = {
        _id: "1",
        name: "Test User",
        email: "test@example.com",
      };
      const mockToken = "test-token";
      const payload: AuthResponse = { user: mockUser, token: mockToken, success: true };

      store.dispatch({
        type: login.fulfilled.type,
        payload,
      });

      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should handle login.rejected", () => {
      const mockError = "Invalid credentials";

      store.dispatch({
        type: login.rejected.type,
        payload: mockError,
      });

      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.error).toBe(mockError);
      expect(state.isAuthenticated).toBe(false);
    });

    it("should handle register.fulfilled", () => {
      const mockUser: User = {
        _id: "2",
        name: "New User",
        email: "new@example.com",
      };
      const mockToken = "new-token";
      const payload: AuthResponse = { user: mockUser, token: mockToken, success: true };

      store.dispatch({
        type: register.fulfilled.type,
        payload,
      });

      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should handle logout.fulfilled", () => {
      // Set initial authenticated state
      const mockUser: User = { _id: "1", name: "Test User", email: "test@example.com" };
      const payload: AuthResponse = { user: mockUser, token: "test-token", success: true };

      store.dispatch({
        type: login.fulfilled.type,
        payload,
      });

      // Reset mock calls after setup
      vi.clearAllMocks();

      // Then logout
      store.dispatch({ type: logout.fulfilled.type });

      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("should handle getUserProfile.fulfilled", () => {
      const mockUser: User = {
        _id: "1",
        name: "Test User",
        email: "test@example.com",
      };
      const payload: AuthResponse = { user: mockUser, success: true };

      store.dispatch({
        type: getUserProfile.fulfilled.type,
        payload,
      });

      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should handle getUserProfile.rejected", () => {
      store.dispatch({
        type: getUserProfile.rejected.type,
        payload: "Authentication failed",
      });

      const state = store.getState().auth;

      expect(state.loading).toBe(false);
      expect(state.error).toBe("Authentication failed");
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("should handle clearError action", () => {
      // Set an error first
      store.dispatch({
        type: login.rejected.type,
        payload: "Some error",
      });

      // Then clear it
      store.dispatch(clearError());

      const state = store.getState().auth;
      expect(state.error).toBeNull();
    });
  });
});

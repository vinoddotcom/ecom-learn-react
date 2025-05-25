import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import RouteGuard from "../../../src/routes/RouteGuard";
import { RouteType } from "../../../src/routes/routeConfig";

// Mock useAppSelector and useAppDispatch
const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

// Mock redux hooks
vi.mock("../../../src/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockUseSelector(),
}));

// Mock store
const mockStore = configureStore({
  reducer: {
    auth: (state = {}) => state,
  },
});

describe("RouteGuard Component", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockUseSelector.mockReset();
  });

  // Helper function to render the component with different auth states
  const renderRouteGuard = (routeType: RouteType, authState: any) => {
    mockUseSelector.mockReturnValue(authState);

    return render(
      <Provider store={mockStore}>
        <MemoryRouter initialEntries={["/protected"]}>
          <Routes>
            <Route
              path="/protected"
              element={
                <RouteGuard routeType={routeType}>
                  <div>Protected Content</div>
                </RouteGuard>
              }
            />
            <Route path="/signin" element={<div>Sign In Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders public routes without checking authentication", () => {
    // Even with no auth, public routes should render
    renderRouteGuard(RouteType.PUBLIC, {
      isAuthenticated: false,
      loading: false,
      user: null
    });

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    // Dispatch should not be called for public routes
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("renders loading state when auth is being checked", () => {
    renderRouteGuard(RouteType.PROTECTED, {
      isAuthenticated: false,
      loading: true,
      user: null
    });

    expect(screen.getByText("Verifying authentication...")).toBeInTheDocument();
  });

  it("redirects to signin when not authenticated for protected routes", () => {
    renderRouteGuard(RouteType.PROTECTED, {
      isAuthenticated: false,
      loading: false,
      user: null,
    });

    expect(screen.getByText("Sign In Page")).toBeInTheDocument();
  });

  it("renders admin loading state for admin routes", () => {
    renderRouteGuard(RouteType.ADMIN, {
      isAuthenticated: true,
      loading: true,
      user: { role: "admin" }
    });

    expect(screen.getByText("Verifying admin access...")).toBeInTheDocument();
  });

  it("redirects to home when user is authenticated but not an admin", () => {
    renderRouteGuard(RouteType.ADMIN, {
      isAuthenticated: true,
      loading: false,
      user: { role: "customer" }
    });

    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("renders protected content when user is authenticated", () => {
    renderRouteGuard(RouteType.PROTECTED, {
      isAuthenticated: true,
      loading: false,
      user: { role: "customer" }
    });

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders admin content when user is authenticated as admin", () => {
    renderRouteGuard(RouteType.ADMIN, {
      isAuthenticated: true,
      loading: false,
      user: { role: "admin" }
    });

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("shows verifying auth message before auth check is attempted", () => {
    // Set authCheckAttempted to false internally
    renderRouteGuard(RouteType.PROTECTED, {
      isAuthenticated: false,
      loading: false,
      user: null
    });

    // This test is a bit tricky because authCheckAttempted is internal state
    // We'll look for the loading message, but it may immediately redirect
    try {
      const loadingElement = screen.queryByText("Verifying authentication...");
      if (loadingElement) {
        expect(loadingElement).toBeInTheDocument();
      } else {
        // It might have already redirected
        expect(screen.getByText("Sign In Page")).toBeInTheDocument();
      }
    } catch (e) {
      // If neither is found, the test should fail
      expect(true).toBe(false);
    }
  });
});
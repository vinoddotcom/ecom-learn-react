import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Header from "../../../src/components/layout/header";
import authReducer from "../../../src/store/slices/authSlice";

// Mock useDispatch and useNavigate
const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
const mockUseSelector = vi.fn();

// Mock Provider component
// const MockProvider = ({ children, store }: any) => <>{children}</>;

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => mockUseSelector(selector),
  Provider: ({ children, store }: any) =>
    React.createElement("div", { "data-testid": "mock-provider", "data-store": store }, children),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock our custom hooks that use Redux hooks
vi.mock("../../../src/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseSelector(selector),
}));

// Mock necessary headlessui components
vi.mock("@headlessui/react", () => {
  return {
    Popover: ({ className, children }: any) => (
      <div className={className} data-testid="popover">
        {children}
      </div>
    ),
    PopoverButton: ({ className, children }: any) => (
      <button className={className} data-testid="popover-button">
        {children}
      </button>
    ),
    PopoverGroup: ({ className, children }: any) => (
      <div className={className} data-testid="popover-group">
        {children}
      </div>
    ),
    PopoverPanel: ({ className, children }: any) => (
      <div className={className} data-testid="popover-panel">
        {children}
      </div>
    ),
    Dialog: ({ open, onClose, children, className }: any) => (
      <div className={className} data-testid={open ? "dialog-open" : "dialog-closed"}>
        {children}
        {open && (
          <button onClick={() => onClose(false)} data-testid="close-dialog">
            Close
          </button>
        )}
      </div>
    ),
    DialogBackdrop: ({ children }: any) => <div data-testid="dialog-backdrop">{children}</div>,
    DialogPanel: ({ children }: any) => <div data-testid="dialog-panel">{children}</div>,
    Tab: ({ children }: any) => <div data-testid="tab">{children}</div>,
    TabGroup: ({ children }: any) => <div data-testid="tab-group">{children}</div>,
    TabList: ({ children }: any) => <div data-testid="tab-list">{children}</div>,
    TabPanel: ({ children }: any) => <div data-testid="tab-panel">{children}</div>,
    TabPanels: ({ children }: any) => <div data-testid="tab-panels">{children}</div>,
  };
});

describe("Header Component", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let store: ReturnType<typeof configureStore>;
  let authState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
  // Add cart state
  let cartState = {
    items: [],
    loading: false,
    error: null,
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer as any,
      },
      preloadedState: {
        auth: { ...authState },
        cart: { ...cartState },
      },
    });
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    mockUseSelector.mockClear();

    // Set up the mock selector to return auth state or cart state based on the selector function
    mockUseSelector.mockImplementation(selector => {
      // If selector is a function (as with useAppSelector), call it with the mock state
      if (typeof selector === "function") {
        return selector({
          auth: authState,
          cart: cartState,
        });
      }

      // Fallback - return auth state by default
      return authState;
    });
  });

  const renderHeader = (preloadedState?: any) => {
    if (preloadedState) {
      // Update our mock state for useSelector to return
      if (preloadedState.auth) {
        authState = preloadedState.auth;
      }
      if (preloadedState.cart) {
        cartState = preloadedState.cart;
      }

      // Also update the Redux store for completeness
      store = configureStore({
        reducer: {
          auth: authReducer,
          // We don't need the reducer here as we're just mocking
        } as any,
        preloadedState,
      });
    }

    return render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  };

  it("renders without crashing", () => {
    renderHeader();

    // Basic header elements should be present
    expect(screen.getByRole("banner")).toBeInTheDocument();
    // Remove this test as there's no free delivery message in the current header
    // expect(screen.getByText(/free delivery/i)).toBeInTheDocument();
  });

  it("shows sign in and create account links when not authenticated", () => {
    renderHeader({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      cart: { items: [] },
    });

    // Check for authentication links
    expect(screen.getAllByText(/sign in/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/create account/i)[0]).toBeInTheDocument();
  });

  it("shows user menu when authenticated", () => {
    const user = {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
    };

    renderHeader({
      auth: {
        user,
        token: "test-token",
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      cart: { items: [] },
    });

    // User's first name should be visible
    expect(screen.getByText("John")).toBeInTheDocument();

    // User icon should be present when no avatar is provided
    const userIcons = screen.getAllByTestId("popover-button");
    expect(userIcons.length).toBeGreaterThan(0);
  });

  it("displays admin option when user has admin role", () => {
    const adminUser = {
      _id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    };

    renderHeader({
      auth: {
        user: adminUser,
        token: "admin-token",
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      cart: { items: [] },
    });

    // Admin user name should be visible
    expect(screen.getByText("Admin")).toBeInTheDocument();

    // Admin options should be present in the user menu popover
    const adminProductsLink = screen.getByText(/admin products/i);
    const adminOrdersLink = screen.getByText(/admin orders/i);
    expect(adminProductsLink).toBeInTheDocument();
    expect(adminOrdersLink).toBeInTheDocument();
  });

  it("dispatches logout action when sign out is clicked", () => {
    renderHeader({
      auth: {
        user: { _id: "1", name: "John Doe", email: "john@example.com" },
        token: "test-token",
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      cart: { items: [] },
    });

    // Find and click sign out button
    const signOutButtons = screen.getAllByText(/sign out/i);
    fireEvent.click(signOutButtons[0]);

    // Check if logout action was dispatched
    expect(mockDispatch).toHaveBeenCalledTimes(1);

    // Check if navigate was called to redirect to home
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("toggles mobile menu when menu button is clicked", () => {
    renderHeader({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      cart: { items: [] },
    });

    // Initially menu should be closed
    expect(screen.getByTestId("dialog-closed")).toBeInTheDocument();

    // Find and click menu button
    const menuButton = screen.getByRole("button", { name: /open menu/i });
    fireEvent.click(menuButton);

    // Menu should now be open
    expect(screen.getByTestId("dialog-open")).toBeInTheDocument();

    // Find and click close button
    const closeButton = screen.getByTestId("close-dialog");
    fireEvent.click(closeButton);

    // Menu should be closed again
    expect(screen.getByTestId("dialog-closed")).toBeInTheDocument();
  });
});

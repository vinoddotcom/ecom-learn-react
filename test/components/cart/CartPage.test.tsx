import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { Provider } from "react-redux";
import CartPage from "../../../src/components/cart/CartPage";
import cartReducer from "../../../src/store/slices/cartSlice";
import { CartItem } from "../../../src/api/cartService";

// Mock useDispatch and useNavigate
const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
const mockUseSelector = vi.fn();

// Create a mock Provider component
const MockProvider = ({ children }: any) => <>{children}</>;

vi.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => mockUseSelector(selector),
  Provider: ({ children, store }: any) => React.createElement(MockProvider, { store }, children),
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

// Mock window.confirm
const originalConfirm = window.confirm;
window.confirm = vi.fn();

describe("CartPage Component", () => {
  let store: ReturnType<typeof configureStore>;
  let sampleCartItems: CartItem[] = [];

  const emptyCartState = {
    cart: {
      items: [],
      isLoading: false,
      error: null,
    },
  };

  const filledCartState = {
    cart: {
      items: [
        {
          productId: "1",
          name: "Test Product 1",
          price: 99.99,
          quantity: 2,
          image: "test1.jpg",
          stock: 10,
        },
        {
          productId: "2",
          name: "Test Product 2",
          price: 49.99,
          quantity: 1,
          image: "test2.jpg",
          stock: 5,
        },
      ],
      isLoading: false,
      error: null,
    },
  };

  beforeEach(() => {
    // Reset all mocks
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    mockUseSelector.mockClear();
    (window.confirm as jest.Mock).mockClear();

    // Default mock implementation to return cart with items
    sampleCartItems = [...filledCartState.cart.items];

    // Mock useSelector to return cart state
    mockUseSelector.mockImplementation(selector => {
      // If selector is a function, call it with the mock state
      if (typeof selector === "function") {
        const state = { cart: { items: sampleCartItems } };
        return selector(state);
      }
      return sampleCartItems;
    });

    // Create Redux store
    store = configureStore({
      reducer: {
        cart: cartReducer,
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to render the component with specified state
  const renderCartPage = (preloadedState = filledCartState) => {
    // Update mock selector behavior based on preloaded state
    sampleCartItems = [...preloadedState.cart.items];

    // Calculate cart total for the mockUseSelector
    const cartTotal = sampleCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Update mock selector to include cart total
    mockUseSelector.mockImplementation(selector => {
      if (typeof selector === "function") {
        const state = { cart: { items: sampleCartItems } };
        // If selecting cart total, return our calculated total
        if (selector === expect.any(Function)) {
          return selector === expect.any(Function) && selector.toString().includes("total")
            ? cartTotal
            : selector(state);
        }
        return selector(state);
      }
      return sampleCartItems;
    });

    return render(
      <Provider store={store}>
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>
      </Provider>
    );
  };

  it("renders empty cart state when cart is empty", () => {
    renderCartPage(emptyCartState);

    expect(screen.getByText("Shopping Cart")).toBeInTheDocument();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(
      screen.getByText("Looks like you haven't added any products to your cart yet.")
    ).toBeInTheDocument();
    expect(screen.getByText("Continue Shopping")).toBeInTheDocument();

    // Empty cart should have a link to products
    const continueShoppingLink = screen.getByText("Continue Shopping");
    expect(continueShoppingLink.closest("a")).toHaveAttribute("href", "/products");
  });

  it("renders cart items when cart has items", () => {
    renderCartPage();

    // Verify cart heading
    expect(screen.getByText("Shopping Cart")).toBeInTheDocument();

    // Verify items are displayed
    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();

    // Verify prices
    expect(screen.getByText("$99.99")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();

    // Verify quantities
    expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("Quantity: 1")).toBeInTheDocument();

    // Verify subtotals
    expect(screen.getByText("Subtotal: $199.98")).toBeInTheDocument(); // 99.99 * 2
    expect(screen.getByText("Subtotal: $49.99")).toBeInTheDocument(); // 49.99 * 1

    // Verify order summary section
    expect(screen.getByText("Order summary")).toBeInTheDocument();
  });

  it("dispatches updateQuantity action when quantity is changed via buttons", () => {
    renderCartPage();

    // Find all plus buttons
    const plusButtons = screen.getAllByRole("button", { name: "" }); // Plus icon buttons

    // Click the first plus button to increase quantity
    fireEvent.click(plusButtons[1]); // Index might need adjustment depending on DOM structure

    // Check if updateQuantity action was dispatched with correct parameters
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { productId: expect.any(String), quantity: expect.any(Number) },
      })
    );
  });

  it("dispatches removeFromCart action when remove button is clicked", () => {
    renderCartPage();

    // Find trash icons (remove buttons)
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });

    // Click the first remove button
    fireEvent.click(removeButtons[0]);

    // Check if removeFromCart action was dispatched with correct product ID
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.any(String),
      })
    );
  });

  it("dispatches clearCart action when clear cart button is clicked and confirmed", () => {
    renderCartPage();

    // Mock confirm to return true
    (window.confirm as jest.Mock).mockReturnValue(true);

    // Find and click the clear cart button
    const clearCartButton = screen.getByText("Clear Shopping Cart");
    fireEvent.click(clearCartButton);

    // Check if confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to remove all items from your cart?"
    );

    // Check if clearCart action was dispatched
    expect(mockDispatch).toHaveBeenCalled();
  });

  it("doesn't dispatch clearCart action when clear cart is cancelled", () => {
    renderCartPage();

    // Mock confirm to return false
    (window.confirm as jest.Mock).mockReturnValue(false);

    // Find and click the clear cart button
    const clearCartButton = screen.getByText("Clear Shopping Cart");
    fireEvent.click(clearCartButton);

    // Check if confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to remove all items from your cart?"
    );

    // Check that clearCart action was not dispatched
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining("clearCart"),
      })
    );
  });

  it("navigates to checkout when Checkout button is clicked", async () => {
    renderCartPage();

    // Find and click the checkout button
    const checkoutButton = screen.getByRole("button", { name: /checkout/i });
    fireEvent.click(checkoutButton);

    // Wait for the timeout in the component
    await waitFor(
      () => {
        // Check if navigate was called with the correct path
        expect(mockNavigate).toHaveBeenCalledWith("/checkout");
      },
      { timeout: 600 }
    ); // Slightly longer than the timeout in the component
  });

  it("shows processing state when checkout is in progress", async () => {
    renderCartPage();

    // Find and click the checkout button
    const checkoutButton = screen.getByRole("button", { name: /checkout/i });
    fireEvent.click(checkoutButton);

    // Check if the button shows processing state
    expect(screen.getByText("Processing...")).toBeInTheDocument();

    // Wait for the timeout in the component
    await waitFor(
      () => {
        // After processing, navigate should be called
        expect(mockNavigate).toHaveBeenCalledWith("/checkout");
      },
      { timeout: 600 }
    );
  });

  it("updates quantity when input field is changed", () => {
    renderCartPage();

    // Find quantity input fields
    const quantityInputs = screen.getAllByRole("spinbutton");

    // Change quantity in the first input
    fireEvent.change(quantityInputs[0], { target: { value: "3" } });

    // Check if updateQuantity action was dispatched with correct parameters
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { productId: expect.any(String), quantity: 3 },
      })
    );
  });
});

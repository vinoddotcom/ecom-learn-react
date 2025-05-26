import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import OrderDetailPage from "../../../src/components/orders/OrderDetailPage";
import OrderService from "../../../src/api/orderService";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import type { Order } from "../../../src/types/generated/Api";

// Mock services
vi.mock("../../../src/api/orderService");

describe("OrderDetailPage", () => {
  // Initial mock store state with authenticated user
  const initialState = {
    auth: {
      isAuthenticated: true,
      user: {
        id: "user123",
        name: "Test User",
        email: "test@example.com",
      },
    },
  };

  // Create a proper Redux store with the initial state
  const store = configureStore({
    reducer: {
      auth: (state = initialState.auth) => state,
    },
  });

  // Helper function to render component with necessary providers
  const renderComponent = (orderId = "test-order-id") => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/orders/${orderId}`]}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders loading state initially", () => {
    renderComponent();
    // Look for the loading spinner by its CSS classes instead of role
    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  test("handles error when API request fails", async () => {
    (OrderService.getOrderById as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      message: "Failed to fetch order details",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch order details/i)).toBeInTheDocument();
    });
  });


});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrdersPage from "../../../src/components/orders/OrdersPage";
import OrderService from "../../../src/api/orderService";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { vi } from "vitest";
import type { Order } from "../../../src/types/generated/Api";

// Mock services
vi.mock("../../../src/api/orderService");

// Setup mock store
const mockStore = configureStore();

describe("OrdersPage", () => {
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

  const store = mockStore(initialState);

  // Helper function to render component with necessary providers
  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <OrdersPage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });  test("renders loading state initially", () => {
    renderComponent();
    // Look for the spinner using class selector
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  test("renders empty state when no orders", async () => {
    (OrderService.getMyOrders as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      orders: [],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/You haven't placed any orders yet/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Browse Products/i)).toBeInTheDocument();
  });  test("renders list of orders", async () => {
    const mockOrders: Order[] = [
      {
        _id: "order-1",
        orderItems: [
          { name: "Product 1", quantity: 1, price: 19.99, image: "image1.jpg", product: "prod1" },
        ],
        shippingInfo: {
          address: "123 Main St",
          city: "Anytown",
          state: "CA",
          country: "USA",
          pinCode: 12345,
          phoneNo: 1234567890,
        },
        paymentInfo: {
          id: "pay_123",
          status: "paid",
        },
        orderStatus: "Processing",
        totalPrice: 19.99,
        createdAt: new Date().toISOString(),
        user: {
          _id: "user123",
          name: "Test User",
          email: "test@example.com",
        },
      },
      {
        _id: "order-2",
        orderItems: [
          { name: "Product 2", quantity: 2, price: 29.99, image: "image2.jpg", product: "prod2" },
        ],
        shippingInfo: {
          address: "456 Oak St",
          city: "Somewhere",
          state: "NY",
          country: "USA",
          pinCode: 54321,
          phoneNo: 9876543210,
        },
        paymentInfo: {
          id: "pay_456",
          status: "paid",
        },
        orderStatus: "Delivered",
        totalPrice: 59.98,
        createdAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        user: {
          _id: "user123",
          name: "Test User",
          email: "test@example.com",
        },
      },
    ];

    (OrderService.getMyOrders as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      orders: mockOrders,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Your Orders/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/Order #order-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-2/i)).toBeInTheDocument();
    expect(screen.getByText(/\$19.99/i)).toBeInTheDocument();
    expect(screen.getByText(/\$59.98/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Processing/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Delivered/i)[0]).toBeInTheDocument();
  });

  test("handles error state", async () => {
    (OrderService.getMyOrders as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      message: "Failed to fetch orders",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch orders/i)).toBeInTheDocument();
    });
  });  test("filters orders by status", async () => {
    const mockOrders: Order[] = [
      {
        _id: "order-1",
        orderStatus: "Processing",
        totalPrice: 19.99,
        createdAt: new Date().toISOString(),
        orderItems: [
          { name: "Test Product", quantity: 1, price: 19.99, image: "img.jpg", product: "prod1" },
        ],
      } as Order,
      {
        _id: "order-2",
        orderStatus: "Shipped",
        totalPrice: 29.99,
        createdAt: new Date().toISOString(),
        orderItems: [
          {
            name: "Another Product",
            quantity: 1,
            price: 29.99,
            image: "img2.jpg",
            product: "prod2",
          },
        ],
      } as Order,
      {
        _id: "order-3",
        orderStatus: "Delivered",
        totalPrice: 39.99,
        createdAt: new Date().toISOString(),
        orderItems: [
          { name: "Third Product", quantity: 1, price: 39.99, image: "img3.jpg", product: "prod3" },
        ],
      } as Order,
    ];

    (OrderService.getMyOrders as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      orders: mockOrders,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Your Orders/i })).toBeInTheDocument();
    });

    // Initially all orders are visible
    expect(screen.getByText(/Order #order-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-2/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-3/i)).toBeInTheDocument();

    // Filter by "Shipped" status
    fireEvent.change(screen.getByLabelText(/Order status/i), { target: { value: "Shipped" } });

    // Now only the Shipped order should be visible
    expect(screen.queryByText(/Order #order-1/i)).not.toBeInTheDocument();
  });

});

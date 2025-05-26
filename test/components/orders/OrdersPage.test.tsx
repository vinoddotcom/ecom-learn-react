import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import OrdersPage from "../../../src/components/orders/OrdersPage";
import OrderService from "../../../src/api/orderService";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { vi } from "vitest";
import type { Order } from "../../../src/types/generated/Api";

// Mock services
vi.mock("../../../src/api/orderService");

// Setup mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

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
  });

  test("renders loading state initially", () => {
    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
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
  });

  test("renders list of orders", async () => {
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
      expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
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
  });

  test("filters orders by status", async () => {
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
      expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
    });

    // Initially all orders are visible
    expect(screen.getByText(/Order #order-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-2/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-3/i)).toBeInTheDocument();

    // Filter by "Shipped" status
    fireEvent.change(screen.getByLabelText(/Order status/i), { target: { value: "Shipped" } });

    // Now only the Shipped order should be visible
    expect(screen.queryByText(/Order #order-1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Order #order-2/i)).toBeInTheDocument();
    expect(screen.queryByText(/Order #order-3/i)).not.toBeInTheDocument();
  });

  test("sorts orders by different criteria", async () => {
    const date1 = new Date(2023, 4, 1).toISOString(); // May 1, 2023
    const date2 = new Date(2023, 4, 15).toISOString(); // May 15, 2023
    const date3 = new Date(2023, 4, 30).toISOString(); // May 30, 2023

    const mockOrders: Order[] = [
      {
        _id: "order-1",
        orderStatus: "Processing",
        totalPrice: 39.99,
        createdAt: date2,
        orderItems: [
          { name: "Test Product", quantity: 1, price: 39.99, image: "img.jpg", product: "prod1" },
        ],
      } as Order,
      {
        _id: "order-2",
        orderStatus: "Shipped",
        totalPrice: 19.99,
        createdAt: date1,
        orderItems: [
          {
            name: "Another Product",
            quantity: 1,
            price: 19.99,
            image: "img2.jpg",
            product: "prod2",
          },
        ],
      } as Order,
      {
        _id: "order-3",
        orderStatus: "Delivered",
        totalPrice: 59.99,
        createdAt: date3,
        orderItems: [
          { name: "Third Product", quantity: 1, price: 59.99, image: "img3.jpg", product: "prod3" },
        ],
      } as Order,
    ];

    (OrderService.getMyOrders as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      orders: mockOrders,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
    });

    // Find all order elements (default sort is date-desc)
    const orderElements = screen.getAllByRole("listitem");

    // The default sorting should be by date, newest first (date-desc)
    // So order-3 (May 30) should be first, then order-1 (May 15), then order-2 (May 1)
    expect(orderElements[0]).toHaveTextContent("order-3");
    expect(orderElements[1]).toHaveTextContent("order-1");
    expect(orderElements[2]).toHaveTextContent("order-2");

    // Sort by price, high to low (price-desc)
    fireEvent.change(screen.getByLabelText(/Sort by/i), { target: { value: "price-desc" } });

    const orderElementsAfterPriceSort = screen.getAllByRole("listitem");
    expect(orderElementsAfterPriceSort[0]).toHaveTextContent("order-3"); // $59.99
    expect(orderElementsAfterPriceSort[1]).toHaveTextContent("order-1"); // $39.99
    expect(orderElementsAfterPriceSort[2]).toHaveTextContent("order-2"); // $19.99
  });

  test("handles pagination with many orders", async () => {
    // Create 15 mock orders to test pagination (default limit is 5 per page)
    const manyOrders = Array.from(
      { length: 15 },
      (_, index) =>
        ({
          _id: `order-${index + 1}`,
          orderStatus: index % 3 === 0 ? "Processing" : index % 3 === 1 ? "Shipped" : "Delivered",
          totalPrice: 10.0 + index,
          createdAt: new Date(2023, 4, index + 1).toISOString(),
          deliveredAt: index % 3 === 2 ? new Date(2023, 4, index + 5).toISOString() : null,
          paidAt: new Date(2023, 4, index + 1, 1).toISOString(),
          orderItems: [
            {
              name: `Product ${index + 1}`,
              quantity: 1,
              price: 10.0 + index,
              image: `img${index}.jpg`,
              product: `prod${index}`,
            },
          ],
          user: {
            _id: "user123",
            name: "Test User",
            email: "test@example.com",
          },
          shippingInfo: {
            address: "123 Test St",
            city: "Test City",
            state: "TS",
            country: "Testland",
            pinCode: 12345,
            phoneNo: 1234567890,
          },
        } as Order)
    );

    (OrderService.getMyOrders as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      orders: manyOrders,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
    });

    // Initially showing first page (5 orders by default)
    expect(screen.getAllByRole("listitem").length).toBe(5);

    // Should show pagination controls
    const nextPageButton = screen.getByLabelText(/next page/i);
    expect(nextPageButton).toBeInTheDocument();

    // Go to next page
    fireEvent.click(nextPageButton);

    // Should now show the second page of orders
    expect(screen.getByText(/Order #order-6/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-10/i)).toBeInTheDocument();
    expect(screen.queryByText(/Order #order-1/i)).not.toBeInTheDocument();

    // Go to third page
    fireEvent.click(nextPageButton);

    // Should now show the third page of orders
    expect(screen.getByText(/Order #order-11/i)).toBeInTheDocument();
    expect(screen.getByText(/Order #order-15/i)).toBeInTheDocument();

    // Check that previous page button works too
    const prevPageButton = screen.getByLabelText(/previous page/i);
    fireEvent.click(prevPageButton);

    // Should go back to second page
    expect(screen.getByText(/Order #order-6/i)).toBeInTheDocument();
    expect(screen.queryByText(/Order #order-11/i)).not.toBeInTheDocument();
  });
});

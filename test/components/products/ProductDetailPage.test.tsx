import React from "react";
import { screen, render, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import ProductDetailPage from "../../../src/components/products/ProductDetailPage";
import ProductService from "../../../src/api/productService";
import cartReducer from "../../../src/store/slices/cartSlice";
import authReducer from "../../../src/store/slices/authSlice";

// Mock react-router-dom's useParams hook
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "test-product-id" }),
  };
});

// Mock AddToCartButton component
vi.mock("../../../src/components/cart/AddToCartButton", () => ({
  default: ({ productId, name, price, quantity, image, stock, className, size }: any) => (
    <button
      data-testid="add-to-cart-button"
      data-product-id={productId}
      data-quantity={quantity}
      className={className}
    >
      Add to Cart
    </button>
  ),
}));

// Mock product data
const mockProduct = {
  _id: "test-product-id",
  name: "Test Product",
  description: "This is a test product\nIt has multiple paragraphs",
  price: 99.99,
  rating: 4.5,
  ratings: 4.5,
  images: [
    { url: "https://example.com/image1.jpg", _id: "img1" },
    { url: "https://example.com/image2.jpg", _id: "img2" },
  ],
  category: "Electronics",
  seller: "Test Seller",
  stock: 10,
  Stock: 10,
  numOfReviews: 2,
  reviews: [
    {
      _id: "review1",
      name: "John Doe",
      rating: 5,
      comment: "Great product!",
      user: "user1",
      createdAt: "2023-01-10T10:00:00.000Z",
    },
    {
      _id: "review2",
      name: "Jane Smith",
      rating: 4,
      comment: "Good but could be better.",
      user: "user2",
      createdAt: "2023-01-15T10:00:00.000Z",
    },
  ],
  user: "seller1",
  createdAt: "2022-12-01T10:00:00.000Z",
};

// Mock ProductService
vi.mock("../../../src/api/productService", () => ({
  default: {
    getProductDetails: vi.fn(),
    submitReview: vi.fn(),
  },
}));

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { _id: "test-user", name: "Test User", email: "test@example.com" },
        loading: false,
        isAuthenticated: true,
        error: null,
      },
    },
  });
};

describe("ProductDetailPage Component", () => {
  const renderComponent = () => {
    const store = createMockStore();
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductDetailPage />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    // Setup default successful response
    (ProductService.getProductDetails as any).mockResolvedValue({
      success: true,
      product: mockProduct,
    });
    (ProductService.submitReview as any).mockResolvedValue({
      success: true,
    });
  });

  test("renders loading state initially", () => {
    renderComponent();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  test("renders product details after successful fetch", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.getByText("$99.99")).toBeInTheDocument();

    // Test that key product information is displayed, using more robust selectors
    const electronicsElements = screen.getAllByText(/Electronics/);
    expect(electronicsElements.length).toBeGreaterThan(0);

    // Verify that price and other important info appears
    expect(screen.getByText(/\$99\.99/)).toBeInTheDocument();

    // Verify that stock info appears
    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  test("renders error message when fetch fails", async () => {
    const errorMessage = "Product not found";
    (ProductService.getProductDetails as any).mockResolvedValue({
      success: false,
      message: "Failed to fetch product",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test("handles network error during fetch", async () => {
    (ProductService.getProductDetails as any).mockRejectedValue(new Error("Network error"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load product details/i)).toBeInTheDocument();
    });
  });

  test("allows changing the quantity", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const increaseButton = screen.getByText("+");
    fireEvent.click(increaseButton);

    const addToCartButton = screen.getByTestId("add-to-cart-button");
    expect(addToCartButton).toHaveAttribute("data-quantity", "2");

    // Test decrease button
    const decreaseButton = screen.getByText("-");
    fireEvent.click(decreaseButton);

    expect(addToCartButton).toHaveAttribute("data-quantity", "1");
  });

  test("quantity cannot go below 1", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Already at 1, try to decrease
    const decreaseButton = screen.getByText("-");
    fireEvent.click(decreaseButton);

    const addToCartButton = screen.getByTestId("add-to-cart-button");
    expect(addToCartButton).toHaveAttribute("data-quantity", "1");
  });

  test("quantity cannot exceed stock", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Increase to max stock
    for (let i = 1; i < mockProduct.stock; i++) {
      const increaseButton = screen.getByText("+");
      fireEvent.click(increaseButton);
    }

    const addToCartButton = screen.getByTestId("add-to-cart-button");
    expect(addToCartButton).toHaveAttribute("data-quantity", mockProduct.stock.toString());

    // Try to exceed stock
    const increaseButton = screen.getByText("+");
    fireEvent.click(increaseButton);

    expect(addToCartButton).toHaveAttribute("data-quantity", mockProduct.stock.toString());
  });

  test("renders product description when toggled", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    const descriptionButton = screen.getByText("Product Description");
    fireEvent.click(descriptionButton);

    // In the mock product, we have this description, so look for part of it
    // The component splits description by newlines, so we need to look for part of a line
    const descriptionText = await screen.findByText(/test product/i);
    expect(descriptionText).toBeInTheDocument();
  });

  test("renders product reviews section", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Great product!")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Good but could be better.")).toBeInTheDocument();
  });

  test("review form submits correctly", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Find the review textarea and submit button
    const commentInput = screen.getByPlaceholderText(/share your experience/i);
    const submitButton = screen.getByText("Submit Review");

    // Fill out and submit the form
    fireEvent.change(commentInput, { target: { value: "This is my review" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(ProductService.submitReview).toHaveBeenCalledWith("test-product-id", {
        rating: 5, // Default value
        comment: "This is my review",
      });
    });
  });

  test("handles review submission error", async () => {
    (ProductService.submitReview as any).mockRejectedValue(new Error("Review submission failed"));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Find the review textarea and submit button
    const commentInput = screen.getByPlaceholderText(/share your experience/i);
    const submitButton = screen.getByText("Submit Review");

    // Fill out and submit the form
    fireEvent.change(commentInput, { target: { value: "This is my review" } });
    fireEvent.click(submitButton);

    // In this implementation there's no error message displayed to the user
    // so we just verify the submitReview was called and the form resets
    await waitFor(() => {
      expect(ProductService.submitReview).toHaveBeenCalled();
      expect(commentInput).toHaveValue("");
    });
  });

  test("renders image gallery and allows navigation between images", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    // Check main image is first one
    const mainImage = screen.getByAltText("Test Product");
    expect(mainImage).toHaveAttribute("src", "https://example.com/image1.jpg");

    // Find and click on the thumbnail for the second image
    const thumbnails = screen.getAllByRole("img");
    // First image is the main one, then we have the thumbnails
    fireEvent.click(thumbnails[2]); // This should be the second thumbnail

    // Check that main image has changed
    expect(mainImage).toHaveAttribute("src", "https://example.com/image2.jpg");
  });

  test("renders empty state when product has no reviews", async () => {
    // Create a product with no reviews
    const productNoReviews = {
      ...mockProduct,
      reviews: [],
      numOfReviews: 0,
    };

    (ProductService.getProductDetails as any).mockResolvedValue({
      success: true,
      product: productNoReviews,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });

    expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
  });
});

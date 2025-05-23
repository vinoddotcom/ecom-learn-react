import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductList from "../ProductList";

// Mock the useFetch hook
vi.mock("../../hooks/useFetch", () => ({
  useFetch: vi.fn(),
}));

// Import the hook and mock response generator after mocking
import { useFetch } from "../../hooks/useFetch";
import { getMockProductsResponse } from "../../api/mockServer";

describe("ProductList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading state initially", () => {
    vi.mocked(useFetch).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<ProductList />);

    expect(screen.getByText("Loading products...")).toBeInTheDocument();
  });

  it("should display error message when fetch fails", () => {
    vi.mocked(useFetch).mockReturnValue({
      data: null,
      loading: false,
      error: "Failed to load products",
      refetch: vi.fn(),
    });

    render(<ProductList />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Failed to load products")).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  it("should display products when fetch is successful", async () => {
    const mockProducts = getMockProductsResponse();

    vi.mocked(useFetch).mockReturnValue({
      data: mockProducts,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ProductList />);

    // Check for product names
    mockProducts.products.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
      expect(screen.getByText(`$${product.price.toFixed(2)}`)).toBeInTheDocument();
    });

    // Check for "Add to Cart" buttons (one for each product)
    const addToCartButtons = screen.getAllByText("Add to Cart");
    expect(addToCartButtons.length).toBe(mockProducts.products.length);
  });

  it('should display "No products found" when products array is empty', () => {
    vi.mocked(useFetch).mockReturnValue({
      data: { success: true, products: [], productsCount: 0 },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ProductList />);

    expect(screen.getByText("No products found.")).toBeInTheDocument();
  });

  it("should call refetch when retry button is clicked", async () => {
    const refetchMock = vi.fn();

    vi.mocked(useFetch).mockReturnValue({
      data: null,
      loading: false,
      error: "Failed to load products",
      refetch: refetchMock,
    });

    render(<ProductList />);

    // Click the retry button
    screen.getByText("Retry").click();

    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("should show mock data notice when using mock data", () => {
    // Save the original env
    const originalEnv = import.meta.env.VITE_USE_MOCK_API;

    // Set env for test
    import.meta.env.VITE_USE_MOCK_API = "true";

    vi.mocked(useFetch).mockReturnValue({
      data: getMockProductsResponse(),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<ProductList />);

    expect(screen.getByText(/Using mock data/)).toBeInTheDocument();

    // Restore original env
    import.meta.env.VITE_USE_MOCK_API = originalEnv;
  });
});

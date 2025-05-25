import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import AdminProductList from "../../../src/components/admin/AdminProductList";
import { render } from "../../../src/test/test-utils";
import ProductService from "../../../src/api/productService";

// Mock ProductService methods
vi.mock("../../../src/api/productService", () => ({
  default: {
    getProducts: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

// Prepare mock data
const mockProducts = [
  {
    _id: "1",
    name: "Test Product 1",
    price: 99.99,
    description: "Test description 1",
    category: "Electronics",
    stock: 50,
    images: [{ public_id: "img1", url: "http://example.com/img1.jpg" }],
  },
  {
    _id: "2",
    name: "Test Product 2",
    price: 149.99,
    description: "Test description 2",
    category: "Clothing",
    stock: 30,
    images: [{ public_id: "img2", url: "http://example.com/img2.jpg" }],
  },
];

describe("AdminProductList Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test for loading state
  it("should show loading state initially", () => {
    // Mock the getProducts function to return a promise that doesn't resolve immediately
    vi.mocked(ProductService.getProducts).mockReturnValue(
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            products: mockProducts as any,
            productsCount: mockProducts.length,
          });
        }, 100);
      })
    );

    render(<AdminProductList />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    expect(screen.getByRole("status")).toBeDefined();
  });

  // Test for rendering products
  it("should render the product list when loaded", async () => {
    vi.mocked(ProductService.getProducts).mockResolvedValue({
      success: true,
      products: mockProducts as any,
      productsCount: mockProducts.length,
    });

    render(<AdminProductList />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Wait for the products to be displayed
    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeDefined();
    });

    expect(screen.getByText("Test Product 2")).toBeDefined();
    expect(screen.getByText("$99.99")).toBeDefined();
    expect(screen.getByText("$149.99")).toBeDefined();

    // Fix: Use getAllByText instead of getByText for texts that appear multiple times
    const electronicsElements = screen.getAllByText("Electronics");
    const clothingElements = screen.getAllByText("Clothing");

    // Verify that at least one element with each category exists
    expect(electronicsElements.length).toBeGreaterThan(0);
    expect(clothingElements.length).toBeGreaterThan(0);
  });

  // Test for error state
  it("should show error message when products fetch fails", async () => {
    vi.mocked(ProductService.getProducts).mockRejectedValue(new Error("API error"));

    render(<AdminProductList />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch products")).toBeDefined();
    });

    expect(screen.getByText("Try Again")).toBeDefined();
  });

  // This test has been updated since access control is now handled by RouteGuard
  it("should handle product loading without access control checks", () => {
    // Mock successful product loading for any user since the component no longer does access checking
    vi.mocked(ProductService.getProducts).mockResolvedValue({
      success: true,
      products: mockProducts as any,
      productsCount: mockProducts.length,
    });

    render(<AdminProductList />, {
      preloadedState: {
        auth: {
          user: { role: "user" }, // Role doesn't matter here as it's checked by RouteGuard
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Component will load products regardless of user role since RouteGuard
    // would prevent this component from mounting for non-admin users
    // This test verifies the component loads without access control errors
    expect(ProductService.getProducts).toHaveBeenCalled();
  });

  // Test for delete product functionality
  it("should delete a product when delete button is clicked", async () => {
    const user = userEvent.setup();

    // First call to getProducts returns both products
    vi.mocked(ProductService.getProducts).mockResolvedValueOnce({
      success: true,
      products: mockProducts,
      productsCount: mockProducts.length,
    } as any);

    // Setup deleteProduct mock
    vi.mocked(ProductService.deleteProduct).mockResolvedValue({
      success: true,
      message: "Product deleted",
    });

    // After deletion, the second call to getProducts should return only the remaining product
    vi.mocked(ProductService.getProducts).mockResolvedValueOnce({
      success: true,
      products: [mockProducts[1]], // Only the second product remains
      productsCount: 1,
    } as any);

    // Mock window.confirm to always return true
    vi.spyOn(window, "confirm").mockImplementation(() => true);

    render(<AdminProductList />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Wait for the products to be displayed
    await waitFor(() => {
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    });

    // Find and click the delete button for the first product
    const deleteButtons = screen.getAllByRole("button", { name: /delete product/i });
    await user.click(deleteButtons[0]);

    // Verify that the delete API was called with the correct product ID
    expect(ProductService.deleteProduct).toHaveBeenCalledWith("1");

    // Verify that the product list is refreshed after deletion
    await waitFor(() => {
      expect(screen.queryByText("Test Product 1")).not.toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    });
  });
});

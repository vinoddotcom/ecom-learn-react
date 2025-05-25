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
    expect(screen.getByText("Electronics")).toBeDefined();
    expect(screen.getByText("Clothing")).toBeDefined();
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
    vi.mocked(ProductService.getProducts).mockResolvedValue({
      products: mockProducts,
    } as any);
    vi.mocked(ProductService.deleteProduct).mockResolvedValue({
      success: true,
      message: "Product deleted",
    });

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
      expect(screen.getByText("Test Product 1")).toBeDefined();
    });

    // Find and click the delete button for the first product
    const deleteButtons = screen.getAllByRole("button");
    const deleteButton = deleteButtons.find(
      button => button.getAttribute("aria-label") === "Delete product"
    );

    if (deleteButton) {
      await user.click(deleteButton);

      // Verify that the delete API was called with the correct product ID
      expect(ProductService.deleteProduct).toHaveBeenCalledWith("1");

      // Verify that the product is removed from the list
      await waitFor(() => {
        expect(screen.queryByText("Test Product 1")).toBeNull();
      });
    } else {
      throw new Error("Delete button not found");
    }
  });
});

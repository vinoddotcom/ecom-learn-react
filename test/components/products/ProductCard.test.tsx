import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ProductCard from "../../../src/components/products/ProductCard";
import type { Product } from "../../../src/api/productService";

// Mock AddToCartButton since we're only testing ProductCard itself
vi.mock("../../../src/components/cart/AddToCartButton", () => ({
  default: ({ productId, name }: { productId: string; name: string }) => (
    <button data-testid="mock-add-to-cart">
      Add {name} to cart (ID: {productId})
    </button>
  ),
}));

describe("ProductCard Component", () => {
  const mockProduct: Product = {
    _id: "123",
    name: "Test Product",
    description: "Test description",
    price: 99.99,
    category: "Electronics",
    Stock: 10,
    images: [
      {
        url: "test-image.jpg",
        public_id: "test-id",
      },
    ],
    rating: 4.5,
    numOfReviews: 25,
    createdAt: new Date().toISOString(),
    user: "user123",
    reviews: [],
  };

  const renderProductCard = (product = mockProduct, showAddToCart = true) => {
    return render(
      <MemoryRouter>
        <ProductCard product={product} showAddToCart={showAddToCart} />
      </MemoryRouter>
    );
  };

  it("renders product name correctly", () => {
    renderProductCard();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renders product price correctly", () => {
    renderProductCard();
    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });

  it("renders product category correctly", () => {
    renderProductCard();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("renders product image with correct attributes", () => {
    renderProductCard();
    const image = screen.getByAltText("Test Product");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test-image.jpg");
  });

  it("renders a fallback image when no images are provided", () => {
    const productWithoutImage = {
      ...mockProduct,
      images: [],
    };
    renderProductCard(productWithoutImage);
    const image = screen.getByAltText("Test Product");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://via.placeholder.com/300");
  });

  it("renders rating stars correctly", () => {
    renderProductCard();

    // The product has a 4.5 rating, so we expect 4 filled stars and 1 empty star
    const stars = document.querySelectorAll("svg");
    expect(stars.length).toBe(5);

    // Test review count is rendered
    expect(screen.getByText("(25)")).toBeInTheDocument();
  });

  it("renders AddToCartButton when showAddToCart is true", () => {
    renderProductCard();
    expect(screen.getByTestId("mock-add-to-cart")).toBeInTheDocument();
  });

  it("does not render AddToCartButton when showAddToCart is false", () => {
    renderProductCard(mockProduct, false);
    expect(screen.queryByTestId("mock-add-to-cart")).not.toBeInTheDocument();
  });

  it("links to the correct product detail page", () => {
    renderProductCard();
    const links = screen.getAllByRole("link");

    // Both the image and text should be links to the product detail
    expect(links.length).toBe(2);

    // Verify both links have the correct href
    links.forEach(link => {
      expect(link).toHaveAttribute("href", "/products/123");
    });
  });

  it("handles products with zero reviews correctly", () => {
    const productWithNoReviews = {
      ...mockProduct,
      numOfReviews: 0,
    };
    renderProductCard(productWithNoReviews);
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });

  it("handles products with null review counts correctly", () => {
    const productWithNullReviews = {
      ...mockProduct,
      numOfReviews: null,
    };
    renderProductCard(productWithNullReviews);
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });

  it("handles products with null ratings correctly", () => {
    const productWithNullRating = {
      ...mockProduct,
      rating: null,
    };

    // This shouldn't throw an error
    renderProductCard(productWithNullRating);

    // With a null rating, all stars should be empty
    const stars = document.querySelectorAll("svg");
    expect(stars.length).toBe(5);
  });
});

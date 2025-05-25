import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import AddToCartButton from "../../../src/components/cart/AddToCartButton";

// Mock useAppDispatch
const mockDispatch = vi.fn();

// Mock store hooks
vi.mock("../../../src/store/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

describe("AddToCartButton Component", () => {
  const defaultProps = {
    productId: "test123",
    name: "Test Product",
    price: 99.99,
    image: "test-image.jpg",
    stock: 10,
  };

  beforeEach(() => {
    mockDispatch.mockClear();
    // Use fake timers for each test
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  it("renders correctly with default props", () => {
    render(<AddToCartButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  it("renders correctly with sm size", () => {
    render(<AddToCartButton {...defaultProps} size="sm" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("p-1.5", "text-xs");
  });

  it("renders correctly with lg size", () => {
    render(<AddToCartButton {...defaultProps} size="lg" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("p-3", "text-base");
  });

  it("can hide text", () => {
    render(<AddToCartButton {...defaultProps} showText={false} />);

    expect(screen.queryByText("Add to Cart")).not.toBeInTheDocument();
  });

  it("is disabled when out of stock", () => {
    render(<AddToCartButton {...defaultProps} stock={0} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
  });

  it("dispatches addToCart action when clicked", () => {
    render(<AddToCartButton {...defaultProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Check if addToCart action was dispatched with correct product
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          productId: "test123",
          name: "Test Product",
          price: 99.99,
          image: "test-image.jpg",
          stock: 10,
          quantity: 1,
        },
      })
    );
  });

  it("changes to Added state after being clicked", async () => {
    render(<AddToCartButton {...defaultProps} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Check if state is changed to "Added"
    expect(screen.getByText("Added")).toBeInTheDocument();

    // The added state should have green styling
    expect(button).toHaveClass("bg-green-50", "text-green-600", "border-green-500");
  });

  it("returns to normal state after timeout", async () => {
    render(<AddToCartButton {...defaultProps} />);

    const button = screen.getByRole("button");

    // Use act to properly handle state updates
    act(() => {
      fireEvent.click(button);
    });

    // Verify button shows "Added" state
    expect(screen.getByText("Added")).toBeInTheDocument();

    // Use act to handle the timer operation
    act(() => {
      // Fast-forward time past the 1500ms timeout
      vi.advanceTimersByTime(1600);
    });

    // Now should be back to "Add to Cart"
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  it("accepts custom className", () => {
    render(<AddToCartButton {...defaultProps} className="custom-class" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("uses custom quantity when provided", () => {
    render(<AddToCartButton {...defaultProps} quantity={3} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Check if addToCart was called with quantity=3
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          quantity: 3,
        }),
      })
    );
  });
});

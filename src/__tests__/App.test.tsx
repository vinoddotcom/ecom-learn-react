import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test/test-utils";
import App from "../App";

// Mock the ProductList component since we've already tested it separately
vi.mock("../components/ProductList", () => ({
  default: () => <div data-testid="product-list-mock">Product List Component</div>,
}));

describe("App Component", () => {
  it("renders without crashing", () => {
    const { container } = render(<App />);
    expect(container).not.toBeNull();
  });

  it("renders the header", () => {
    render(<App />);
    expect(screen.getByText("Ecommerce with React")).toBeInTheDocument();
  });

  it("includes the ProductList component", () => {
    render(<App />);
    expect(screen.getByTestId("product-list-mock")).toBeInTheDocument();
  });

  it("displays the logo images", () => {
    render(<App />);
    const images = document.querySelectorAll("img.logo");
    expect(images.length).toBeGreaterThan(0);
  });
});

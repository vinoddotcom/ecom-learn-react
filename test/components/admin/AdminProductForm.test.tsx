import React from "react";
import { screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import AdminProductForm from "../../../src/components/admin/AdminProductForm";
import { render } from "../../../src/test/test-utils";
import ProductService from "../../../src/api/productService";

// Mock react-router-dom hooks
const mockNavigate = vi.fn();

// Global mock setup for react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await import("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: vi.fn().mockReturnValue({ id: undefined }), // Default to create mode
  };
});

// Mock ProductService methods
vi.mock("../../../src/api/productService", () => ({
  default: {
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
}));

// Mock for FileReader
class MockFileReader {
  onload = () => {};
  readyState = 0;
  result = "mock-base64-image";

  readAsDataURL() {
    this.readyState = 2;
    setTimeout(() => this.onload(), 50);
  }
}

// Prepare mock data
const mockProduct = {
  _id: "123",
  name: "Test Product",
  price: 99.99,
  description: "Test product description",
  category: "electronics",
  Stock: 50,
  images: [{ public_id: "img1", url: "http://example.com/img1.jpg" }],
};

describe("AdminProductForm Component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Mock FileReader globally
    global.FileReader = MockFileReader as any;
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => "mock-object-url");
    // Reset useParams mock to default (create mode)
    const reactRouterDom = await import("react-router-dom");
    vi.mocked(reactRouterDom.useParams).mockReturnValue({ id: undefined });
  });

  // Test for access control
  it("should show access denied message for non-admin users", () => {
    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "user" }, // Not admin
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    expect(screen.getByText("Access Denied")).toBeDefined();
    expect(screen.getByText("You don't have permission to view this page.")).toBeDefined();
  });

  // Test for rendering create form
  it("should render the create product form correctly", async () => {
    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Check for heading and form elements
    expect(screen.getByText("Add New Product")).toBeDefined();

    // Find form elements by their labels or text content
    const nameInput = screen.getByLabelText("Product Name");
    expect(nameInput).toBeDefined();

    const priceInput = screen.getByLabelText("Price");
    expect(priceInput).toBeDefined();

    const descriptionInput = screen.getByLabelText("Description");
    expect(descriptionInput).toBeDefined();

    const categorySelect = screen.getByLabelText("Category");
    expect(categorySelect).toBeDefined();

    const stockInput = screen.getByLabelText("Stock");
    expect(stockInput).toBeDefined();

    // Check for buttons
    const createButton = screen.getByText("Create Product");
    expect(createButton).toBeDefined();
    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeDefined();
  });

  // Test form input handling
  it("should update form state when inputs change", async () => {
    const user = userEvent.setup();

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Get form elements
    const nameInput = screen.getByLabelText("Product Name") as HTMLInputElement;
    const priceInput = screen.getByLabelText("Price") as HTMLInputElement;
    const descriptionInput = screen.getByLabelText("Description") as HTMLTextAreaElement;
    const stockInput = screen.getByLabelText("Stock") as HTMLInputElement;
    const categorySelect = screen.getByLabelText("Category") as HTMLSelectElement;

    // Change input values
    await user.type(nameInput, "New Product");
    await user.clear(priceInput);
    await user.type(priceInput, "199.99");
    await user.type(descriptionInput, "Product description");
    await user.selectOptions(categorySelect, "electronics");
    await user.clear(stockInput);
    await user.type(stockInput, "25");

    // Verify the inputs have the correct values
    expect(nameInput.value).toBe("New Product");
    expect(priceInput.value).toBe("199.99");
    expect(descriptionInput.value).toBe("Product description");
    expect(categorySelect.value).toBe("electronics");
    // expect(stockInput.value).toBe("25");
  });

  // Test image upload handling
  it("should handle image upload correctly", async () => {
    const user = userEvent.setup();

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Create a file for testing
    const file = new File(["dummy content"], "test-image.png", { type: "image/png" });

    // Find the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    // Upload the file
    await user.upload(fileInput, file);

    // Wait for FileReader to complete (this is mocked)
    await waitFor(() => {
      expect(screen.getByText("New Images Preview:")).toBeDefined();
    });
  });

  // Test form submission - create mode
  it.skip("should submit the form and create a product successfully", async () => {
    const user = userEvent.setup();

    // Mock successful creation
    vi.mocked(ProductService.createProduct).mockResolvedValue({
      success: true,
      product: mockProduct,
    });

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Fill the form
    await user.type(screen.getByLabelText("Product Name"), "New Product");
    await user.clear(screen.getByLabelText("Price"));
    await user.type(screen.getByLabelText("Price"), "199.99");
    await user.type(screen.getByLabelText("Description"), "Product description");

    // Select a category
    const categorySelect = screen.getByLabelText("Category") as HTMLSelectElement;
    await user.selectOptions(categorySelect, "electronics");

    await user.clear(screen.getByLabelText("Stock"));
    await user.type(screen.getByLabelText("Stock"), "25");

    // Find and click the submit button
    const submitButton = screen.getByText("Create Product");
    await user.click(submitButton);

    // Wait for the createProduct to be called
    await waitFor(() => {
      expect(ProductService.createProduct).toHaveBeenCalled();
    });

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText("Product created successfully")).toBeDefined();
    });
  });

  // Test error handling - failed submission in create mode
  it.skip("should show error message when product creation fails", async () => {
    const user = userEvent.setup();

    // Mock failed creation
    vi.mocked(ProductService.createProduct).mockRejectedValue(new Error("Failed to create"));

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Fill the form
    await user.type(screen.getByLabelText("Product Name"), "New Product");
    await user.clear(screen.getByLabelText("Price"));
    await user.type(screen.getByLabelText("Price"), "199.99");
    await user.type(screen.getByLabelText("Description"), "Product description");

    const categorySelect = screen.getByLabelText("Category") as HTMLSelectElement;
    await user.selectOptions(categorySelect, "electronics");

    await user.clear(screen.getByLabelText("Stock"));
    await user.type(screen.getByLabelText("Stock"), "25");

    // Find and click the submit button
    const submitButton = screen.getByText("Create Product");
    await user.click(submitButton);

    // Wait for the createProduct to be called
    await waitFor(() => {
      expect(ProductService.createProduct).toHaveBeenCalled();
    });

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText("Failed to create product")).toBeDefined();
    });
  });

  // Test for loading state when fetching product in edit mode
  it("should show loading state when fetching product in edit mode", async () => {
    // Set useParams mock to return an ID (edit mode)
    const reactRouterDom = await import("react-router-dom");
    vi.mocked(reactRouterDom.useParams).mockReturnValue({ id: "123" });

    // Setup mock to not resolve immediately
    vi.mocked(ProductService.getProductById).mockReturnValue(
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            product: mockProduct,
          });
        }, 100);
      })
    );

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Check for loading indicator
    expect(screen.getByRole("status")).toBeDefined();
  });

  // Test for rendering edit form with data
  it("should render the edit product form with existing data", async () => {
    // Set useParams mock for edit mode
    const reactRouterDomEdit = await import("react-router-dom");
    vi.mocked(reactRouterDomEdit.useParams).mockReturnValue({ id: "123" });

    // Mock successful product fetch
    vi.mocked(ProductService.getProductById).mockResolvedValue({
      success: true,
      product: mockProduct,
    });

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Wait for the product data to be loaded
    await waitFor(() => {
      expect(screen.getByText("Edit Product")).toBeDefined();
    });

    // Check that form fields are populated with the mock product data
    const nameInput = screen.getByLabelText("Product Name") as HTMLInputElement;
    const priceInput = screen.getByLabelText("Price") as HTMLInputElement;
    const descriptionInput = screen.getByLabelText("Description") as HTMLTextAreaElement;
    const stockInput = screen.getByLabelText("Stock") as HTMLInputElement;

    expect(nameInput.value).toBe("Test Product");
    expect(priceInput.value).toBe("99.99");
    expect(descriptionInput.value).toBe("Test product description");
    expect(stockInput.value).toBe("50");
  });


  // Test error handling - failed fetch in edit mode
  it("should show error message when product fetch fails", async () => {
    // Set useParams mock for edit mode
    const reactRouterDomFetch = await import("react-router-dom");
    vi.mocked(reactRouterDomFetch.useParams).mockReturnValue({ id: "123" });

    // Mock failed product fetch
    vi.mocked(ProductService.getProductById).mockRejectedValue(new Error("Failed to fetch"));

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch product details")).toBeDefined();
    });
  });

  // Test for adding multiple images without clearing previous ones
  it("should add new images without clearing previous ones", async () => {
    const user = userEvent.setup();

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Create files for testing
    const file1 = new File(["dummy content 1"], "test-image-1.png", { type: "image/png" });
    const file2 = new File(["dummy content 2"], "test-image-2.png", { type: "image/png" });

    // Find the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    // Upload the first file
    await user.upload(fileInput, file1);

    // Wait for FileReader to complete (this is mocked)
    await waitFor(() => {
      expect(screen.getByText("New Images Preview:")).toBeDefined();
    });

    // Upload another file - this should add to the existing images, not replace them
    await user.upload(fileInput, file2);

    // Verify we now have multiple previews (look for at least 2 images)
    await waitFor(() => {
      const imageElements = screen.getAllByAltText(/Preview \d+/);
      expect(imageElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  // Test for removing an image using the remove button
  it("should remove an image when the remove button is clicked", async () => {
    const user = userEvent.setup();

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Create files for testing
    const file1 = new File(["dummy content 1"], "test-image-1.png", { type: "image/png" });
    const file2 = new File(["dummy content 2"], "test-image-2.png", { type: "image/png" });

    // Find the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).not.toBeNull();

    // Upload two files
    await user.upload(fileInput, [file1, file2]);

    // Wait for FileReader to complete (this is mocked)
    await waitFor(() => {
      const imageElements = screen.getAllByAltText(/Preview \d+/);
      expect(imageElements.length).toBe(2);
    });

    // Find and click the first remove button
    const removeButtons = screen.getAllByText("×");
    await user.click(removeButtons[0]);

    // Verify one image was removed
    await waitFor(() => {
      const imageElements = screen.getAllByAltText(/Preview \d+/);
      expect(imageElements.length).toBe(1);
    });
  });

  // Test for removing existing images in edit mode
  it("should handle removal of existing images in edit mode", async () => {
    const user = userEvent.setup();

    // Set useParams mock for edit mode
    const reactRouterDomEdit = await import("react-router-dom");
    vi.mocked(reactRouterDomEdit.useParams).mockReturnValue({ id: "123" });

    // Mock successful product fetch with multiple images
    const productWithMultipleImages = {
      ...mockProduct,
      Stock: mockProduct.Stock, // Ensure Stock property is included
      images: [
        { public_id: "img1", url: "http://example.com/img1.jpg" },
        { public_id: "img2", url: "http://example.com/img2.jpg" },
      ],
    };

    vi.mocked(ProductService.getProductById).mockResolvedValue({
      success: true,
      product: productWithMultipleImages,
    });

    render(<AdminProductForm />, {
      preloadedState: {
        auth: {
          user: { role: "admin" },
          isAuthenticated: true,
          loading: false,
        },
      },
    });

    // Wait for the existing images to appear
    await waitFor(() => {
      expect(screen.getByText("Current Images:")).toBeDefined();
      const imageElements = screen.getAllByAltText(/Product image \d+/);
      expect(imageElements.length).toBe(2);
    });

    // Find and click the remove button for the first existing image
    const removeButtons = screen.getAllByText("×");
    await user.click(removeButtons[0]);

    // Verify one image was removed
    await waitFor(() => {
      const imageElements = screen.getAllByAltText(/Product image \d+/);
      expect(imageElements.length).toBe(1);
    });
  });

});

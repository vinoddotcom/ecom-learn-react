import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductService from "../productService";
import { apiHelper } from "../config";
import { sampleProducts } from "../mockServer";

// Mock the apiHelper
vi.mock("../config", () => {
  return {
    apiHelper: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe("ProductService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProducts", () => {
    it("should call apiHelper.get with the correct URL when no filters are provided", async () => {
      const mockResponse = {
        success: true,
        products: sampleProducts,
        productsCount: sampleProducts.length,
      };

      vi.mocked(apiHelper.get).mockResolvedValueOnce(mockResponse);

      const result = await ProductService.getProducts();

      expect(apiHelper.get).toHaveBeenCalledWith("/products");
      expect(result).toEqual(mockResponse);
    });

    it("should call apiHelper.get with query parameters when filters are provided", async () => {
      const filters = {
        keyword: "test",
        category: "electronics",
        page: 1,
        limit: 10,
        price: {
          gte: 100,
          lte: 500,
        },
        ratings: 4,
      };

      const mockResponse = {
        success: true,
        products: sampleProducts,
        productsCount: sampleProducts.length,
      };

      vi.mocked(apiHelper.get).mockResolvedValueOnce(mockResponse);

      const result = await ProductService.getProducts(filters);

      expect(apiHelper.get).toHaveBeenCalledWith(expect.stringMatching(/^\/products\?/));

      // Check that URL contains expected parameters
      const url = vi.mocked(apiHelper.get).mock.calls[0][0] as string;
      expect(url).toContain("keyword=test");
      expect(url).toContain("category=electronics");
      expect(url).toContain("page=1");
      expect(url).toContain("limit=10");
      expect(url).toContain("price%5Bgte%5D=100"); // encoded price[gte]=100
      expect(url).toContain("price%5Blte%5D=500"); // encoded price[lte]=500
      expect(url).toContain("ratings%5Bgte%5D=4"); // encoded ratings[gte]=4

      expect(result).toEqual(mockResponse);
    });
  });

  describe("getProductById", () => {
    it("should call apiHelper.get with the correct URL and product ID", async () => {
      const productId = "123";
      const mockResponse = {
        success: true,
        product: sampleProducts[0],
      };

      vi.mocked(apiHelper.get).mockResolvedValueOnce(mockResponse);

      const result = await ProductService.getProductById(productId);

      expect(apiHelper.get).toHaveBeenCalledWith(`/products/${productId}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("createProduct", () => {
    it("should call apiHelper.post with the correct URL, data, and headers", async () => {
      const formData = new FormData();
      const mockResponse = {
        success: true,
        product: sampleProducts[0],
      };

      vi.mocked(apiHelper.post).mockResolvedValueOnce(mockResponse);

      const result = await ProductService.createProduct(formData);

      expect(apiHelper.post).toHaveBeenCalledWith("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateProduct", () => {
    it("should call apiHelper.put with the correct URL, data, and headers", async () => {
      const productId = "123";
      const formData = new FormData();
      const mockResponse = {
        success: true,
        product: sampleProducts[0],
      };

      vi.mocked(apiHelper.put).mockResolvedValueOnce(mockResponse);

      const result = await ProductService.updateProduct(productId, formData);

      expect(apiHelper.put).toHaveBeenCalledWith(`/products/${productId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteProduct", () => {
    it("should call apiHelper.delete with the correct URL", async () => {
      const productId = "123";
      const mockResponse = {
        success: true,
      };

      vi.mocked(apiHelper.delete).mockResolvedValueOnce(mockResponse);

      const result = await ProductService.deleteProduct(productId);

      expect(apiHelper.delete).toHaveBeenCalledWith(`/products/${productId}`);
      expect(result).toEqual(mockResponse);
    });
  });
});

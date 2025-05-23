import { describe, it, expect } from "vitest";
import { sampleProducts, getMockProductsResponse, getMockProductResponse } from "../mockServer";

describe("Mock Server", () => {
  describe("sampleProducts", () => {
    it("should contain sample product data", () => {
      expect(sampleProducts).toBeDefined();
      expect(Array.isArray(sampleProducts)).toBe(true);
      expect(sampleProducts.length).toBeGreaterThan(0);
    });

    it("should have correctly structured product objects", () => {
      const product = sampleProducts[0];
      expect(product).toHaveProperty("_id");
      expect(product).toHaveProperty("name");
      expect(product).toHaveProperty("price");
      expect(product).toHaveProperty("description");
      expect(product).toHaveProperty("images");
    });
  });

  describe("getMockProductsResponse", () => {
    it("should return a properly formatted product list response", () => {
      const response = getMockProductsResponse();
      expect(response).toBeDefined();
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("products");
      expect(response).toHaveProperty("productsCount");
      expect(Array.isArray(response.products)).toBe(true);
      expect(response.productsCount).toBe(response.products.length);
    });
  });

  describe("getMockProductResponse", () => {
    it("should return a product when given a valid ID", () => {
      const validId = sampleProducts[0]._id as string;
      const response = getMockProductResponse(validId);
      expect(response).toBeDefined();
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("product");
      expect(response.product?._id).toBe(validId);
    });

    it("should indicate failure when given an invalid ID", () => {
      const invalidId = "invalid-id";
      const response = getMockProductResponse(invalidId);
      expect(response).toBeDefined();
      expect(response).toHaveProperty("success", false);
      expect(response.product).toBeUndefined();
      expect(response).toHaveProperty("message", "Product not found");
    });
  });
});

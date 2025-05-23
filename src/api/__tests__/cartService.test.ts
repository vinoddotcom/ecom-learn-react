import { describe, it, expect, beforeEach, afterEach } from "vitest";
import CartService from "../cartService";

// Sample cart items for testing
const sampleCartItems = [
  {
    productId: "1",
    name: "Test Product 1",
    price: 99.99,
    quantity: 2,
    image: "test1.jpg",
    stock: 10,
  },
  {
    productId: "2",
    name: "Test Product 2",
    price: 49.99,
    quantity: 1,
    image: "test2.jpg",
    stock: 5,
  },
];

describe("CartService", () => {
  // Clear localStorage before and after each test
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("getCart", () => {
    it("should return an empty array when cart is empty", () => {
      const cart = CartService.getCart();
      expect(cart).toEqual([]);
    });

    it("should return cart items from localStorage", () => {
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));
      const cart = CartService.getCart();
      expect(cart).toEqual(sampleCartItems);
    });

    it("should return empty array if localStorage contains invalid JSON", () => {
      localStorage.setItem("ecom_cart", "invalid-json");
      const cart = CartService.getCart();
      expect(cart).toEqual([]);
    });
  });

  describe("addToCart", () => {
    it("should add a new item to cart", () => {
      const newItem = {
        productId: "3",
        name: "Test Product 3",
        price: 29.99,
        quantity: 1,
        image: "test3.jpg",
        stock: 8,
      };

      const updatedCart = CartService.addToCart(newItem);
      expect(updatedCart).toHaveLength(1);
      expect(updatedCart[0]).toEqual(newItem);

      // Check localStorage was updated
      const storedCart = JSON.parse(localStorage.getItem("ecom_cart") || "[]");
      expect(storedCart).toEqual(updatedCart);
    });

    it("should update quantity if item is already in cart", () => {
      // Add initial item
      const initialItem = {
        productId: "1",
        name: "Test Product 1",
        price: 99.99,
        quantity: 1,
        image: "test1.jpg",
        stock: 10,
      };
      CartService.addToCart(initialItem);

      // Add same item again
      const updatedItem = {
        ...initialItem,
        quantity: 2,
      };
      const updatedCart = CartService.addToCart(updatedItem);

      // Total quantity should be 3 (1 + 2)
      expect(updatedCart).toHaveLength(1);
      expect(updatedCart[0].quantity).toBe(3);
    });

    it("should limit quantity to available stock", () => {
      // Add item with limited stock
      const item = {
        productId: "1",
        name: "Test Product 1",
        price: 99.99,
        quantity: 8,
        image: "test1.jpg",
        stock: 10,
      };
      CartService.addToCart(item);

      // Try to add more than available stock
      const additionalItem = {
        ...item,
        quantity: 5,
      };
      const updatedCart = CartService.addToCart(additionalItem);

      // Quantity should be limited to stock (10)
      expect(updatedCart[0].quantity).toBe(10);
    });
  });

  describe("updateQuantity", () => {
    it("should update the quantity of an existing item", () => {
      // Add initial items
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));

      // Update quantity
      const updatedCart = CartService.updateQuantity("1", 5);

      expect(updatedCart[0].quantity).toBe(5);
      expect(updatedCart[1].quantity).toBe(1); // Unchanged
    });

    it("should remove the item if quantity is set to 0", () => {
      // Add initial items
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));

      // Set quantity to 0 (should remove item)
      const updatedCart = CartService.updateQuantity("1", 0);

      expect(updatedCart).toHaveLength(1);
      expect(updatedCart[0].productId).toBe("2");
    });

    it("should do nothing if the product ID is not found", () => {
      // Add initial items
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));

      // Update non-existent product
      const updatedCart = CartService.updateQuantity("999", 5);

      expect(updatedCart).toEqual(sampleCartItems);
    });
  });

  describe("removeFromCart", () => {
    it("should remove an item from the cart", () => {
      // Add initial items
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));

      // Remove first item
      const updatedCart = CartService.removeFromCart("1");

      expect(updatedCart).toHaveLength(1);
      expect(updatedCart[0].productId).toBe("2");
    });

    it("should return unchanged cart if product is not found", () => {
      // Add initial items
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));

      // Remove non-existent product
      const updatedCart = CartService.removeFromCart("999");

      expect(updatedCart).toEqual(sampleCartItems);
    });
  });

  describe("clearCart", () => {
    it("should remove all items from cart", () => {
      // Add initial items
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));

      // Clear cart
      CartService.clearCart();

      // Check localStorage was cleared
      expect(localStorage.getItem("ecom_cart")).toBeNull();

      // Check getCart returns empty array
      expect(CartService.getCart()).toEqual([]);
    });
  });

  describe("getCartTotal", () => {
    it("should calculate total price correctly", () => {
      // Add initial items
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));

      // Calculate expected total: (99.99 * 2) + (49.99 * 1) = 249.97
      const total = CartService.getCartTotal();

      // Using toBeCloseTo to handle floating point precision
      expect(total).toBeCloseTo(249.97);
    });

    it("should return 0 for empty cart", () => {
      const total = CartService.getCartTotal();
      expect(total).toBe(0);
    });
  });

  describe("getCartItemsCount", () => {
    it("should calculate total items count correctly", () => {
      // Add initial items (2 + 1 = 3 items)
      localStorage.setItem("ecom_cart", JSON.stringify(sampleCartItems));

      const count = CartService.getCartItemsCount();
      expect(count).toBe(3);
    });

    it("should return 0 for empty cart", () => {
      const count = CartService.getCartItemsCount();
      expect(count).toBe(0);
    });
  });
});

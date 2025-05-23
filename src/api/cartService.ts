
// Types will be manually defined here as they might not be part of the generated API types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

// Non-API specific model - this manages cart in local storage
class CartService {
  private readonly CART_KEY = "ecom_cart";

  /**
   * Get cart items from local storage
   */
  getCart(): CartItem[] {
    try {
      const cartItems = localStorage.getItem(this.CART_KEY);
      return cartItems ? JSON.parse(cartItems) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
      return [];
    }
  }

  /**
   * Add item to cart
   */
  addToCart(item: CartItem): CartItem[] {
    const cart = this.getCart();
    const existingItemIndex = cart.findIndex(cartItem => cartItem.productId === item.productId);

    if (existingItemIndex !== -1) {
      // Item already in cart, update quantity
      cart[existingItemIndex].quantity += item.quantity;

      // Ensure quantity doesn't exceed stock
      if (cart[existingItemIndex].quantity > cart[existingItemIndex].stock) {
        cart[existingItemIndex].quantity = cart[existingItemIndex].stock;
      }
    } else {
      // Add new item to cart
      cart.push(item);
    }

    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    return cart;
  }

  /**
   * Update cart item quantity
   */
  updateQuantity(productId: string, quantity: number): CartItem[] {
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex !== -1) {
      cart[itemIndex].quantity = quantity;

      // Remove item if quantity is 0
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      }

      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    }

    return cart;
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: string): CartItem[] {
    const cart = this.getCart();
    const updatedCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem(this.CART_KEY, JSON.stringify(updatedCart));
    return updatedCart;
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    localStorage.removeItem(this.CART_KEY);
  }

  /**
   * Get cart total
   */
  getCartTotal(): number {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  /**
   * Get cart items count
   */
  getCartItemsCount(): number {
    const cart = this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
}

export default new CartService();

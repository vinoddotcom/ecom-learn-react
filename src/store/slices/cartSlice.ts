import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import cartService, { type CartItem } from "../../api/cartService";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: CartState = {
  items: cartService.getCart(), // Initialize with items from local storage
  isLoading: false,
  error: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const cartItems = cartService.addToCart(action.payload);
      state.items = cartItems;
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const cartItems = cartService.updateQuantity(productId, quantity);
      state.items = cartItems;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const cartItems = cartService.removeFromCart(action.payload);
      state.items = cartItems;
    },
    clearCart: state => {
      cartService.clearCart();
      state.items = [];
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCartError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  setCartLoading,
  setCartError,
} = cartSlice.actions;

// Type-safe selectors that don't depend on RootState
// This avoids circular dependencies
type AppState = {
  cart: CartState;
};

// Export selectors
export const selectCartItems = (state: AppState) => state.cart.items;
export const selectCartItemsCount = (state: AppState) =>
  state.cart.items.reduce((count: number, item: CartItem) => count + item.quantity, 0);
export const selectCartTotal = (state: AppState) =>
  state.cart.items.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0);
export const selectIsCartLoading = (state: AppState) => state.cart.isLoading;
export const selectCartError = (state: AppState) => state.cart.error;

export default cartSlice.reducer;

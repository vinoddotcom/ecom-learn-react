import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// Import cart reducer directly, since we fixed the circular dependency in cartSlice.ts
import cartReducer from "./slices/cartSlice";

// Create the store with all reducers
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    // Add other reducers here as needed
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

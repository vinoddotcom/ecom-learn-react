// Main API module that exports all API services
import axiosInstance, { apiHelper } from "./config";
import AuthService from "./authService";
import ProductService from "./productService";
import OrderService from "./orderService";
import CartService from "./cartService";

// Use mock services in development if configured

// Export the API services
export {
  axiosInstance,
  apiHelper,
  AuthService,
   ProductService,
  OrderService,
  CartService,
};

// Export the API service types
export type { User, AuthResponse, PasswordUpdateData, ProfileUpdateData } from "./authService";
export type {
  Product,
  ProductListResponse,
  ProductResponse,
  ProductFilters,
} from "./productService";
export type { CreateOrderRequest, OrderResponse, OrderListResponse } from "./orderService";
export type { CartItem } from "./cartService";

// Create a default export of all services
const API = {
  auth: AuthService,
  products: ProductService,
  orders: OrderService,
  cart: CartService,
};

export default API;

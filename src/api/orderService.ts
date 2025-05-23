import { apiHelper } from "./config";
import type { Order, ShippingInfo, PaymentInfo } from "../types/generated/Api";

export interface CreateOrderRequest {
  orderItems: {
    name: string;
    price: number;
    quantity: number;
    image: string;
    product: string;
  }[];
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
}

export interface OrderResponse {
  success: boolean;
  order?: Order;
  message?: string;
}

export interface OrderListResponse {
  success: boolean;
  orders: Order[];
  count: number;
}

const OrderService = {
  /**
   * Create a new order
   */
  createOrder: (orderData: CreateOrderRequest) =>
    apiHelper.post<OrderResponse>("/orders", orderData),

  /**
   * Get order by ID
   */
  getOrderById: (orderId: string) => apiHelper.get<OrderResponse>(`/orders/${orderId}`),

  /**
   * Get all orders for the current user
   */
  getMyOrders: () => apiHelper.get<OrderListResponse>("/orders/me"),

  /**
   * Get all orders (admin only)
   */
  getAllOrders: () => apiHelper.get<OrderListResponse>("/orders"),

  /**
   * Update order status (admin only)
   */
  updateOrderStatus: (orderId: string, status: string) =>
    apiHelper.put<OrderResponse>(`/orders/${orderId}/status`, { status }),

  /**
   * Delete order (admin only)
   */
  deleteOrder: (orderId: string) => apiHelper.delete<OrderResponse>(`/orders/${orderId}`),
};

export default OrderService;

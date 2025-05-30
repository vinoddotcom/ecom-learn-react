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

export interface AdminOrderResponse {
  success?: boolean;
  message?: string;
}

export interface OrderListResponse {
  success: boolean;
  orders: Order[];
  count: number;
}

export interface AdminOrderListResponse {
  success?: boolean;
  totalAmount?: number;
  orders?: Order[];
}

const OrderService = {
  /**
   * Create a new order
   */
  createOrder: (orderData: CreateOrderRequest) =>
    apiHelper.post<OrderResponse>("/order/new", orderData),

  /**
   * Get order by ID
   */
  getOrderById: (orderId: string) => apiHelper.get<OrderResponse>(`/order/${orderId}`),

    /**
   * Get order by ID (admin only)
   */
  deleteAdminOrderById: (orderId: string) => apiHelper.delete<AdminOrderResponse>(`admin/orders/${orderId}`),

      /**
   * Get order by ID (admin only)
   */
  updateAdminOrderById: (orderId: string) => apiHelper.put<AdminOrderResponse>(`admin/order/${orderId}`),

  /**
   * Get all orders for the current user
   */
  getMyOrders: () => apiHelper.get<OrderListResponse>("/orders/me"),

  /**
   * Get all orders
   */
  getAllOrders: () => apiHelper.get<OrderListResponse>("/orders"),

  /**
   * Get all orders (admin only)
   */
  getAdminOrders: () => apiHelper.get<AdminOrderListResponse>("/admin/orders"),

  /**
   * Update order status (admin only)
   */
  updateOrderStatus: (orderId: string, status: string) =>
    apiHelper.put<OrderResponse>(`admin/order/${orderId}`, { status }),

  /**
   * Delete order (admin only)
   */
  deleteOrder: (orderId: string) => apiHelper.delete<OrderResponse>(`admin/order/${orderId}`),
};

export default OrderService;

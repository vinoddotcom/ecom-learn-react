// Route types
export type RouteType = "public" | "protected" | "admin";

// Route type constants
export const RouteType = {
  PUBLIC: "public" as RouteType, // No authentication required
  PROTECTED: "protected" as RouteType, // User authentication required
  ADMIN: "admin" as RouteType, // Admin authentication required
};

// Route path definitions - this helps to have a central place for all route paths
export const RoutePath = {
  HOME: "/",
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  ORDERS: "/orders",
  ORDER_DETAIL: "/orders/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_PRODUCTS_NEW: "/admin/products/new",
  ADMIN_PRODUCTS_EDIT: "/admin/products/edit/:id",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER_DETAIL: "/admin/orders/:id",
};

// Simple route configuration without React components
export interface RouteConfig {
  path: string;
  type: RouteType;
  exact?: boolean;
}

// Routes configuration without React components
export const routes: RouteConfig[] = [
  {
    path: RoutePath.HOME,
    type: RouteType.PUBLIC,
  },
  {
    path: RoutePath.SIGNIN,
    type: RouteType.PUBLIC,
  },
  {
    path: RoutePath.SIGNUP,
    type: RouteType.PUBLIC,
  },
  {
    path: RoutePath.PRODUCTS,
    type: RouteType.PUBLIC,
  },
  {
    path: RoutePath.PRODUCT_DETAIL,
    type: RouteType.PUBLIC,
  },
  {
    path: RoutePath.PROFILE,
    type: RouteType.PROTECTED,
  },
  {
    path: RoutePath.ORDERS,
    type: RouteType.PROTECTED,
  },
  {
    path: RoutePath.ORDER_DETAIL,
    type: RouteType.PROTECTED,
  },
  {
    path: RoutePath.CART,
    type: RouteType.PUBLIC,
  },
  {
    path: RoutePath.CHECKOUT,
    type: RouteType.PROTECTED,
  },
  {
    path: RoutePath.ADMIN_PRODUCTS,
    type: RouteType.ADMIN,
  },
  {
    path: RoutePath.ADMIN_PRODUCTS_NEW,
    type: RouteType.ADMIN,
  },
  {
    path: RoutePath.ADMIN_PRODUCTS_EDIT,
    type: RouteType.ADMIN,
  },
  {
    path: RoutePath.ADMIN_ORDERS,
    type: RouteType.ADMIN,
  },
  {
    path: RoutePath.ADMIN_ORDER_DETAIL,
    type: RouteType.ADMIN,
  },
];

// Function to check if a route is protected (either user or admin)
export const isProtectedRoute = (routePath: string): boolean => {
  // Find the route in our config
  const route = routes.find(r => r.path === routePath);

  return route?.type === RouteType.PROTECTED || route?.type === RouteType.ADMIN;
};

// Function to check if a route is admin only
export const isAdminRoute = (routePath: string): boolean => {
  // Find the route in our config
  const route = routes.find(r => r.path === routePath);

  return route?.type === RouteType.ADMIN;
};

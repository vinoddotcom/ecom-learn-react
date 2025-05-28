# Network Layer with Axios

This project includes a comprehensive network layer built with Axios to handle API communications. Here's an overview of the API structure and how to use it:

## Structure

The network layer is organized into the following files:

- `src/api/config.ts` - Core Axios configuration with interceptors and helper functions
- `src/api/authService.ts` - Authentication related API calls
- `src/api/productService.ts` - Product related API calls
- `src/api/orderService.ts` - Order related API calls
- `src/api/cartService.ts` - Local cart management with localStorage
- `src/api/index.ts` - Main export file that combines all services

## Features

- **Automatic token handling** - JWT tokens are automatically added to requests when available
- **Error handling** - Common error cases are handled (401, 403, 404, 500, etc.)
- **Type safety** - All API responses are typed using generated types from Swagger/OpenAPI
- **Helper methods** - Simplified methods (get, post, put, patch, delete) for API calls
- **Centralized configuration** - API base URL and other settings are configurable

## Usage Examples

### Authentication

```typescript
import { AuthService } from "./api";

// Login
const login = async (email: string, password: string) => {
  try {
    const response = await AuthService.login(email, password);
    if (response.success && response.token) {
      localStorage.setItem("authToken", response.token);
    }
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// Get current user
const getCurrentUser = async () => {
  try {
    const response = await AuthService.getMyProfile();
    return response.user;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return null;
  }
};
```

### Products

```typescript
import { ProductService } from "./api";

// Get products with filters
const getFilteredProducts = async () => {
  const filters = {
    category: "electronics",
    price: {
      gte: 100,
      lte: 1000,
    },
    ratings: 4,
    page: 1,
    limit: 10,
  };

  try {
    const response = await ProductService.getProducts(filters);
    return response.products;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

// Get product details
const getProductDetails = async (productId: string) => {
  try {
    const response = await ProductService.getProductById(productId);
    return response.product;
  } catch (error) {
    console.error("Failed to fetch product details:", error);
    return null;
  }
};
```

### Orders

```typescript
import { OrderService } from "./api";

// Create new order
const createOrder = async orderData => {
  try {
    const response = await OrderService.createOrder(orderData);
    return response;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
};

// Get my orders
const getMyOrders = async () => {
  try {
    const response = await OrderService.getMyOrders();
    return response.orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
};
```

### Cart (Local Storage)

```typescript
import { CartService } from "./api";

// Add product to cart
const addToCart = product => {
  const cartItem = {
    productId: product._id,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.images[0]?.url,
    stock: product.stock,
  };

  CartService.addToCart(cartItem);
};

// Get cart items
const getCartItems = () => {
  return CartService.getCart();
};

// Get cart total
const getCartTotal = () => {
  return CartService.getCartTotal();
};
```

## Environment Variables

The API base URL can be configured via environment variables:

```
REACT_APP_API_BASE_URL=http://your-api-url/api/v1
```

If not specified, it defaults to `https://api.vinod.digital/api/v1`.

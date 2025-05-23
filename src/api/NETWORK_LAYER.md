# Network Layer Documentation

## Overview

This project uses Axios to handle API communications. The network layer is designed to be robust, with proper error handling and support for both real API endpoints and mock data.

## Features

- **Axios Configuration**: Central configuration for API requests with automatic token handling
- **Error Handling**: Comprehensive error handling across different types of request failures
- **Mock Data Support**: Development mode with mock data to work without a backend
- **TypeScript Integration**: Fully typed API responses and requests
- **Custom Hooks**: Reusable fetch hooks with loading and error states

## Key Files

- `/src/api/config.ts` - Core Axios configuration
- `/src/api/productServiceWithMocks.ts` - Mock version of product service
- `/src/api/mockServer.ts` - Mock data definitions
- `/src/hooks/useFetch.ts` - Custom hook for data fetching with error handling

## Environment Variables

The API layer uses the following environment variables:

- `VITE_API_BASE_URL`: Base URL for the API (default: http://localhost:5000/api/v1)

## Error Handling

The network layer handles the following error cases:

1. **Server Errors**: When the server responds with an error status code
2. **Network Errors**: When no response is received from the server
3. **Request Setup Errors**: When there's an issue setting up the request
4. **Authentication Errors**: When the token is expired or invalid (401)

## Using the API

```tsx
// Using the ProductService directly
import { ProductService } from "../api";

const products = await ProductService.getProducts();
const product = await ProductService.getProductById("123");

// Using the custom hook
import { useFetch } from "../hooks/useFetch";

const { data, loading, error, refetch } = useFetch(() => ProductService.getProducts(), []);

// Access data like this
const products = data?.products || [];
```

## Testing Without a Backend

To test the UI without a working backend:

1. Set `VITE_USE_MOCK_API=true` in your `.env` file
2. The app will use mock data from `mockServer.ts`
3. You can customize the mock data in that file for testing different scenarios

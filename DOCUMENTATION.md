# E-Commerce React Application - Technical Documentation

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Authentication](#authentication)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)

## Overview

This documentation provides technical details for the React e-commerce application built with TypeScript and Vite. This document is intended for developers who are working on or contributing to the project.

## Architecture

### Frontend Architecture

The application follows a component-based architecture with React. It uses:

- **Vite** as the build tool and development server
- **React Router** for client-side routing
- **Redux Toolkit** for state management
- **Axios** for API requests
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### Key Design Patterns

1. **Container/Presentational Pattern**: We separate logic and UI concerns by having container components that handle state and data fetching, and presentational components focused purely on UI rendering.

2. **Custom Hooks**: Shared logic is extracted into custom hooks to encourage reuse and separation of concerns. For example, `useFetch` handles API request states.

3. **Feature-based Structure**: Components are organized by feature rather than type, making it easier to understand and maintain the codebase.

## Project Structure

The project follows a feature-based organization:

```
src/
├── api/                # API services and configuration
│   ├── authService.ts  # Authentication API calls
│   ├── cartService.ts  # Cart operations
│   ├── config.ts       # API configurations
│   ├── mockServer.ts   # Mock API for development
│   ├── orderService.ts # Order operations
│   └── productService.ts # Product-related API calls
├── assets/             # Static assets
├── components/         # UI components organized by feature
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication components
│   ├── cart/           # Shopping cart components
│   ├── home/           # Homepage components
│   ├── layout/         # Layout components (header, footer)
│   ├── orders/         # Order management components
│   ├── products/       # Product listing and details
│   └── routes/         # Route-related components
├── hooks/              # Custom React hooks
├── routes/             # Routing configuration
├── store/              # Redux store setup
│   ├── hooks.ts        # Type-safe hooks for Redux
│   ├── index.ts        # Store configuration
│   └── slices/         # Redux slices
│       ├── authSlice.ts # Authentication state
│       └── cartSlice.ts # Cart state
├── types/              # TypeScript type definitions
│   └── generated/      # Auto-generated types from API schema
├── utils/              # Utility functions
├── App.tsx             # Main app component
├── index.css           # Global styles
└── main.tsx            # Application entry point
```

## Setup and Installation

### Prerequisites

- Node.js v16+ (LTS recommended)
- npm v8+ or yarn v1.22+

### Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/ecom-learn-react.git
   cd ecom-learn-react
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the project root with:

   ```
   REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
   VITE_USE_MOCK_API=true  # Set to 'false' to use real API
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Authentication

### Implementation

Authentication is implemented using JWT (JSON Web Tokens):

1. User credentials are sent to the authentication endpoint
2. The server returns a JWT token
3. The token is stored in localStorage
4. A Redux slice (`authSlice.ts`) manages the authentication state
5. Protected routes use the `RouteGuard.tsx` component to verify authentication

### Protected Routes

Routes requiring authentication are wrapped with the `AdminRoute.tsx` or `RouteGuard.tsx` components, which check for valid authentication before rendering.

## State Management

### Redux Store

The application uses Redux Toolkit for state management:

- `store/index.ts` - Configures the Redux store
- `store/hooks.ts` - Provides type-safe hooks for accessing the store
- `store/slices/` - Contains Redux slices for different features

### Key State Slices

1. **Authentication State (authSlice.ts)**

   - Manages user authentication status and user data
   - Handles login, signup, and logout actions

2. **Cart State (cartSlice.ts)**
   - Manages shopping cart items
   - Handles adding, removing, and updating cart items

## API Integration

### Network Layer

The application uses Axios for API requests. The network layer is organized as follows:

- `api/config.ts` - Central Axios configuration with interceptors for auth and error handling
- Service modules (e.g., `productService.ts`, `authService.ts`) - Encapsulate API endpoints
- Type definitions are auto-generated from OpenAPI specifications in `types/generated/Api.ts`

### Mock API

During development, the application can use a mock API:

- `api/mockServer.ts` - Sets up MSW (Mock Service Worker) handlers
- Toggle between real and mock API using the `VITE_USE_MOCK_API` environment variable

## Testing Strategy

### Test Setup

The application uses Vitest and React Testing Library for testing:

- `vitest.config.ts` - Vitest configuration
- `test/setup.ts` - Global test setup
- `test/test-utils.tsx` - Utilities for testing with Redux and Router

### Test Types

1. **Unit Tests**

   - Test individual functions and hooks
   - Located in `__tests__` folders next to the source files

2. **Component Tests**

   - Test component rendering and interactions
   - Located in the `test/components` directory

3. **Integration Tests**
   - Test interactions between components and services
   - Located in the `test` directory organized by feature

### Running Tests

- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:run` - Run tests once
- `npm run coverage` - Generate test coverage report

## Deployment

### AWS Infrastructure and CI/CD

The application is deployed to AWS using a comprehensive infrastructure setup:

- **Amazon S3** for static file hosting
- **Amazon CloudFront** for content delivery and edge caching
- **AWS Certificate Manager** for SSL certificates
- **Amazon Route 53** for domain management
- **GitHub Actions** for CI/CD pipeline
- **GitHub OIDC** for secure AWS authentication
- **Terraform** for infrastructure as code

Detailed documentation is available in:

- [AWS Infrastructure Setup](./docs/updated-s3-deployment-setup.md)
- [Deployment Guide](./docs/updated-deployment.md)
- [Multi-Environment CI/CD](./docs/updated-ci-cd-environments.md)
- [GitHub OIDC Authentication](./docs/github-oidc-auth.md)
- [Terraform State Management](./docs/terraform-state-management-guide.md)
- [Git Branch to Terraform Workspace Binding](./docs/git-terraform-workspace-binding.md)

### Build Process

1. Build the application for production:

   ```bash
   npm run build
   ```

2. The build output is generated in the `dist` directory

### Docker Deployment

The project includes Docker configuration for containerized deployment:

1. Build the Docker image:

   ```bash
   docker build -t ecom-learn-react .
   ```

2. Run the container:
   ```bash
   docker run -p 80:80 ecom-learn-react
   ```

### Nginx Configuration

The project uses Nginx to serve the static files in production:

- `nginx.conf` - Contains the Nginx configuration for routing and caching

## Performance Considerations

### Optimization Techniques

1. **Code Splitting**

   - The application uses React.lazy for component-level code splitting
   - Route-based splitting for better initial load performance

2. **Image Optimization**

   - Images are optimized for web delivery
   - Use of modern image formats where supported

3. **CSS Optimization**

   - Tailwind CSS is configured to purge unused styles in production
   - Critical CSS is inlined for faster rendering

4. **State Management**
   - Redux state is normalized for efficient updates
   - Selectors are memoized to prevent unnecessary re-renders

## Troubleshooting

### Common Issues

1. **Node Version Conflicts**

   - This project requires Node.js v16 or newer
   - Check your Node.js version with `node --version`
   - Consider using [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions

2. **Port Conflicts**

   - If port 5173 is already in use, specify a different port:
     ```bash
     npm run dev -- --port 3000
     ```

3. **API Connection Issues**

   - Check that your `.env` file is set up correctly
   - If using a real API, ensure it's running and accessible
   - Look for CORS issues in your browser's developer console

4. **Build Errors**

   - If encountering TypeScript errors during build:
     ```bash
     npm run build -- --skipLibCheck
     ```

5. **Test Failures**
   - Reset the test environment:
     ```bash
     npm run test:run -- --clearCache
     ```

### Debugging Tools

1. **Redux DevTools**

   - The Redux store is configured to work with the Redux DevTools extension
   - Use it to inspect state changes and action payloads

2. **React DevTools**

   - Use React DevTools to inspect component tree and props
   - Profile renders to identify performance bottlenecks

3. **Network Monitoring**
   - Use browser DevTools to monitor network requests
   - API errors are logged to the console in development mode

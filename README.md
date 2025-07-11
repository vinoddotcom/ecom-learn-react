# E-Commerce React Application

This project is a React-based e-commerce application with TypeScript, built using Vite.

> **Note:** For detailed technical documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)

## Features

- Product listing and details
- Shopping cart functionality
- User authentication
- Order management
- Admin section for product and order management
- Responsive design with Tailwind CSS

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setting Up Your Local Development Environment](#setting-up-your-local-development-environment)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Infrastructure](#infrastructure)
- [Project Structure](#project-structure)
- [API Layer](#api-layer)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Contributing](#contributing)
- [Technical Requirements](#technical-requirements)
- [Troubleshooting](#troubleshooting)
- [Performance Optimization](#performance-optimization)
- [Browser Support](#browser-support)
- [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16+) - Latest LTS version recommended
- npm v8+ or yarn v1.22+ (this guide uses npm commands)
- Git
- A code editor (VS Code recommended)

## Setting Up Your Local Development Environment

Follow these steps to set up the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/ecom-learn-react.git
   cd ecom-learn-react
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root (see [Environment Variables](#environment-variables) section)

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:5173](http://localhost:5173)

5. **Generate API types (optional)**

   If you want to update the API types from the latest OpenAPI specification:

   ```bash
   npm run generate-api
   ```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
REACT_APP_API_BASE_URL=https://api.vinod.digital/api/v1
VITE_USE_MOCK_API=true  # Set to 'false' to use real API
```

- `REACT_APP_API_BASE_URL`: The base URL for your API endpoints
- `VITE_USE_MOCK_API`: When set to `true`, the application will use mock data instead of making actual API calls

## Available Scripts

The project includes the following npm scripts:

- `npm run dev` - Start the development server with hot-reload
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run Vitest in watch mode
- `npm run test:ui` - Run Vitest with UI
- `npm run test:run` - Run Vitest tests once
- `npm run coverage` - Generate test coverage report
- `npm run generate-api` - Generate TypeScript definitions from OpenAPI specification

## Project Structure

```
src/
├── api/              # API services and configuration
├── assets/           # Static assets like images
├── components/       # UI components organized by feature
├── hooks/            # Custom React hooks
├── routes/           # Routing configuration
├── store/            # Redux store setup and slices
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── main.tsx          # Application entry point
```

## API Layer

The application includes a comprehensive network layer built with Axios:

- Centralized API configuration
- Error handling
- Authentication flow with JWT
- Mock data support for development

For detailed information about the network layer, see [Network Layer Documentation](./src/api/NETWORK_LAYER.md).

## Testing

This project uses Vitest and React Testing Library for testing. Tests are located next to the files they test or in dedicated `__tests__` folders.

To run tests:

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Generate test coverage
npm run coverage
```

## Deployment

This project uses a CI/CD pipeline with GitHub Actions for automated builds and deployments to multiple environments.

### Infrastructure

The infrastructure is managed with Terraform and includes:

- **Amazon S3**: For hosting the static files of the React application
- **Amazon CloudFront**: Serves as a CDN to deliver the application with low latency
- **AWS Certificate Manager**: Provides SSL certificates for secure HTTPS access
- **Route 53**: Manages DNS records for custom domain configuration
- **GitHub OIDC**: Provides secure authentication to AWS without storing credentials

### Documentation

Detailed documentation is available for various aspects of deployment:

- [Deployment Guide](./docs/deployment.md): Overview of the deployment process
- [CI/CD Environments](./docs/ci-cd-environments.md): Details on multi-environment setup
- [S3 Deployment Setup](./docs/s3-deployment-setup.md): AWS infrastructure setup
- [GitHub OIDC Authentication](./docs/github-oidc-auth.md): Secure AWS authentication
- [Terraform State Management](./docs/terraform-state-management-guide.md): Managing Terraform state
- [Git Branch to Terraform Workspace Binding](./docs/git-terraform-workspace-binding.md): How Git branches map to environments
- **GitHub OIDC**: Secure authentication between GitHub Actions and AWS

For detailed infrastructure documentation, see [terraform/README.md](./terraform/README.md).

### Multi-Environment Setup

The project supports multiple deployment environments:

| Environment | Git Branch   | Domain            |
| ----------- | ------------ | ----------------- |
| Development | `main`       | dev.vinod.digital |
| Production  | `production` | vinod.digital     |

Each environment has its own:

- S3 bucket
- CloudFront distribution
- IAM permissions
- Configuration values

### CI/CD Pipeline

The project includes a CI/CD workflow that automatically:

1. Identifies the target environment based on the Git branch
2. Builds the application with environment-specific configuration
3. Runs tests
4. Deploys to the appropriate S3 bucket
5. Invalidates the CloudFront cache for immediate updates

For more information about the CI/CD workflow, see [.github/workflows/WORKFLOW_DOCUMENTATION.md](./.github/workflows/WORKFLOW_DOCUMENTATION.md).

## Docker Deployment

The project includes Docker configuration for easy deployment:

1. **Build the Docker image**

   ```bash
   docker build -t ecom-learn-react .
   ```

2. **Run the container**

   ```bash
   docker run -p 80:80 ecom-learn-react
   ```

   The application will be available at [http://localhost](http://localhost)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## Technical Requirements

This project uses the following technologies:

- **React 19.1.0** - Latest version with advanced rendering optimizations
- **TypeScript 5.8** - For type safety and improved developer experience
- **Vite 6.3** - Fast build tool and development server
- **Redux Toolkit** - For state management
- **React Router v7** - For client-side routing
- **Tailwind CSS 4.1** - For styling
- **Axios** - For API requests
- **Vitest** - For testing
- **ESLint 9** - For code quality
- **MSW** - For API mocking during development and testing

## Troubleshooting

### Common Issues

1. **Node version conflicts**

   This project requires Node.js v16 or newer. If you encounter errors during installation, check your Node.js version:

   ```bash
   node --version
   ```

   Consider using [nvm](https://github.com/nvm-sh/nvm) to manage multiple Node.js versions.

2. **Port already in use**

   If port 5173 is already in use, Vite will automatically try to use the next available port. Alternatively, you can specify a port:

   ```bash
   npm run dev -- --port 3000
   ```

3. **API connection issues**

   - Make sure your `.env` file is set up correctly
   - If connecting to a real API, ensure it's running and accessible
   - Check for CORS issues in your browser's developer console

4. **Build issues**

   If you encounter TypeScript errors during build:

   ```bash
   npm run build -- --skipLibCheck
   ```

5. **Test failures**

   If tests are failing, try resetting the test environment:

   ```bash
   npm run test:run -- --clearCache
   ```

## Performance Optimization

- The application uses React.lazy for code splitting
- Images are optimized for web delivery
- Tailwind CSS is configured to purge unused styles in production
- Redux state is normalized for efficient updates

## Browser Support

This application is designed to work with:

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

Internet Explorer is not supported.

## License

[MIT](LICENSE)

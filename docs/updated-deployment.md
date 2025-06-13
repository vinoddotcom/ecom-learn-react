# Deployment Guide

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci-cd.yml`.

## Infrastructure

Our infrastructure is managed using Terraform with remote state management and follows a GitOps approach for multi-environment deployments.

### Amazon S3

The built React application is stored in an S3 bucket with the following configuration:

- Secure bucket with public access blocked
- Content only accessible through CloudFront
- Environment-specific bucket names:
  - Development: `dev.vinod.digital`
  - Production: `vinod.digital`

### Amazon CloudFront

CloudFront is used as a CDN in front of the S3 bucket to provide:

- Global low-latency access
- HTTPS support with TLS 1.2
- Edge caching for better performance
- URL normalization for SPA routing
- Custom error handling to support client-side routing

### ACM Certificate

SSL certificates are automatically provisioned and validated through DNS:

- Covers apex domain and wildcard subdomains
- Auto-renews before expiration
- Requires Route 53 as the DNS provider

### Route 53

DNS configuration includes:

- A records pointing to CloudFront distributions
- Automatic certificate validation records

## Workflow Process

1. When code is pushed to the appropriate branch, the CI/CD workflow is triggered
2. The appropriate environment is selected based on the branch:
   - `main` → development environment
   - `production` → production environment
3. The application is built using `npm run build`
4. Unit tests are run to ensure quality
5. AWS credentials are obtained using OIDC (no long-lived credentials stored in GitHub)
6. Built files are uploaded to the appropriate S3 bucket
7. A CloudFront cache invalidation is created to ensure users get the latest version

## Security Features

The deployment uses several security best practices:

- GitHub OIDC authentication for secure, short-lived AWS credentials
- No AWS access keys stored in GitHub Secrets
- IAM roles with least privilege access
- S3 bucket with all public access blocked
- CloudFront Origin Access Control (OAC) for secure S3 access

## Environment Configuration

The CI/CD pipeline uses GitHub Environments to manage config:

- Environment-specific variables stored in GitHub repository settings
- Dynamic environment selection based on Git branch
- Protection rules can be applied to the production environment in GitHub

## Terraform Remote State Management

Infrastructure state is securely stored in:

- S3 bucket: `terraform-state-vinod-digital` with versioning and encryption
- DynamoDB table: `terraform-locks` for state locking

For more details, see:

- [Infrastructure Documentation](../terraform/README.md)
- [State Management Documentation](../terraform/STATE_MANAGEMENT.md)
- [Workspace Binding Documentation](../terraform/WORKSPACE_BINDING.md)

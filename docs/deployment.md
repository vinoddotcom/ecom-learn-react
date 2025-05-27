# Deployment Guide

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/ci-cd.yaml`.

## Infrastructure

### Amazon S3

The built React application is stored in an S3 bucket configured for static website hosting. This provides:

- Reliable file storage
- Version control capabilities
- Low-cost hosting

### Amazon CloudFront

CloudFront is used as a CDN (Content Delivery Network) in front of the S3 bucket to provide:

- Global low-latency access
- HTTPS support
- Edge caching for better performance

## Workflow Process

1. When code is pushed to the main branch, the CI/CD workflow is triggered
2. The application is built using `npm run build`
3. Unit tests are run to ensure quality
4. Built files are uploaded to the S3 bucket
5. A CloudFront cache invalidation is created to ensure users get the latest version

## Manual Deployment

If you need to deploy manually, follow these steps:

1. Build the application: `npm run build`
2. Upload the contents of the `build` directory to the S3 bucket
3. Create a CloudFront invalidation if needed

## Environment Configuration

The CI/CD pipeline requires the following secrets to be configured in GitHub:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

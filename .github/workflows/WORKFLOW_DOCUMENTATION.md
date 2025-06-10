# GitHub Actions CI/CD Workflow

This document explains the automated CI/CD workflow that deploys the React application to AWS based on Git branches.

## Overview

The GitHub Actions workflow automatically deploys your React application to the appropriate environment based on the Git branch:

- Pushes to `main` branch → Deploy to **development** environment
- Pushes to `production` branch → Deploy to **production** environment

## Workflow Files

1. `multi_env_deploy.yml` - Main workflow file that handles both environments

## Environment Configuration

The workflow automatically sets environment-specific variables:

| Environment | S3 Bucket         | Domain            | GitHub Secret References                           |
| ----------- | ----------------- | ----------------- | -------------------------------------------------- |
| Development | dev.vinod.digital | dev.vinod.digital | DEV_AWS_ROLE_ARN, DEV_CLOUDFRONT_DISTRIBUTION_ID   |
| Production  | vinod.digital     | vinod.digital     | PROD_AWS_ROLE_ARN, PROD_CLOUDFRONT_DISTRIBUTION_ID |

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

1. **Development Environment**:

   - `DEV_AWS_ROLE_ARN`: ARN of the IAM role for GitHub Actions (dev)
   - `DEV_CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID (dev)

2. **Production Environment**:
   - `PROD_AWS_ROLE_ARN`: ARN of the IAM role for GitHub Actions (prod)
   - `PROD_CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID (prod)

## Workflow Process

1. **Environment Detection**: Determines which environment to deploy to based on:

   - Git branch (`main` → development, `production` → production)
   - Manual workflow dispatch input (when triggered manually)

2. **Build Process**:

   - Checks out the code
   - Sets up Node.js environment
   - Installs dependencies
   - Runs tests
   - Builds the application with environment-specific variables

3. **Deployment Process**:
   - Assumes the appropriate IAM role via OIDC
   - Uploads build files to the correct S3 bucket
   - Creates CloudFront invalidation to ensure latest content is served

## Environment-Specific Build Variables

The workflow sets environment-specific build variables:

```yaml
REACT_APP_API_URL: ${{ needs.set-environment.outputs.environment == 'production' && 'https://api.vinod.digital' || 'https://dev-api.vinod.digital' }}
```

This allows your React application to use different API endpoints or other configuration based on the environment.

## Manual Deployment

You can also manually trigger a deployment to a specific environment using the "workflow_dispatch" event:

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Deploy React App to AWS" workflow
3. Click "Run workflow"
4. Choose the environment (development or production)
5. Click "Run workflow"

## Promoting Changes to Production

The typical workflow to promote changes from development to production is:

1. Make changes on a feature branch
2. Open a PR to merge into the `main` branch
3. Review, approve, and merge the PR
4. Test the changes in the development environment
5. Create a PR from `main` to `production`
6. Review, approve, and merge the PR to deploy to production

## CloudFront Invalidation

After deploying to S3, the workflow automatically creates a CloudFront invalidation to ensure that users get the latest version of your application immediately.

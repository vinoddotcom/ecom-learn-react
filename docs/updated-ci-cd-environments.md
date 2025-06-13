# Multi-Environment CI/CD Deployment

This document explains how our CI/CD pipeline deploys to multiple environments based on Git branches using GitHub OIDC authentication for secure AWS access.

## Environments

The CI/CD pipeline supports two environments:

1. **Development Environment**

   - Deploys from the `main` branch
   - Domain: `dev.vinod.digital`
   - S3 Bucket: `dev.vinod.digital`
   - CloudFront Distribution: Configured automatically by Terraform
   - IAM Role: `github-actions-manage-s3-cloudfront-dev-vinod-digital`

2. **Production Environment**
   - Deploys from the `production` branch
   - Domain: `vinod.digital`
   - S3 Bucket: `vinod.digital`
   - CloudFront Distribution: Configured automatically by Terraform
   - IAM Role: `github-actions-manage-s3-cloudfront-vinod-digital`

## GitHub OIDC Authentication

Our CI/CD pipeline uses GitHub OIDC (OpenID Connect) for AWS authentication instead of long-lived access keys. Benefits include:

- No AWS credentials stored in GitHub Secrets
- Short-lived credentials generated during workflow execution
- Automatic credential rotation
- Fine-grained access control based on repository and workflow context

### How OIDC Works in Our Setup

1. GitHub Actions workflow requests authentication from AWS
2. AWS validates that the request comes from an authorized GitHub repository and workflow
3. AWS provides temporary credentials via AssumeRoleWithWebIdentity
4. GitHub Actions uses these credentials to access AWS resources

## GitHub Environments Setup

The CI/CD workflow uses GitHub Environments to manage environment-specific configuration.

### Setting Up Environments in GitHub

1. Go to your repository on GitHub
2. Click on "Settings"
3. In the left sidebar, click on "Environments"
4. Create two environments:
   - `development`
   - `production`

### Environment Variables

Our environment variables are dynamically determined based on the Git branch. These values are pulled from:

1. GitHub Environment variables (for sensitive or environment-specific values)
2. Terraform outputs (populated automatically by our deployment script)
3. Fallback values in the workflow file

You should set the following variables in the production environment:

- `S3_BUCKET_NAME`: `vinod.digital`
- `IAM_ROLE_ARN`: The ARN of the IAM role (from Terraform output)
- `CLOUDFRONT_DISTRIBUTION_ID`: The CloudFront distribution ID (from Terraform output)

## Branch Strategy

Our Git branching strategy is:

- Feature branches for development work
- Merge to `main` for deployment to development environment
- Merge to `production` for deployment to production environment

## Testing Infrastructure Changes

For testing infrastructure changes:

1. Make changes to Terraform files
2. Run `cd terraform && ./apply_terraform.sh` which will:
   - Detect your current Git branch
   - Select the appropriate workspace
   - Apply the changes to the correct environment

## Troubleshooting

Common issues and solutions:

1. **Access Denied Errors**: Ensure the GitHub OIDC role has appropriate permissions
2. **Invalidation Failures**: Check CloudFront distribution ID is correct
3. **Failed Deployments**: Review GitHub Actions logs for detailed error messages

## Reference: CI/CD Environment Mapping

| Git Branch   | Environment | Domain            | S3 Bucket         | IAM Role                                              |
| ------------ | ----------- | ----------------- | ----------------- | ----------------------------------------------------- |
| `main`       | development | dev.vinod.digital | dev.vinod.digital | github-actions-manage-s3-cloudfront-dev-vinod-digital |
| `production` | production  | vinod.digital     | vinod.digital     | github-actions-manage-s3-cloudfront-vinod-digital     |

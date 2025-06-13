# AWS Infrastructure Setup for React App Deployment

This document outlines the AWS infrastructure setup managed by Terraform for our React application deployment.

## Infrastructure Components

Our AWS infrastructure includes:

1. **S3 Buckets**

   - Static website content storage
   - Terraform state management
   - Public access blocked for security

2. **CloudFront Distribution**

   - Content delivery network for global low-latency access
   - HTTPS with TLS 1.2
   - Custom domain support
   - URL normalization for SPA routing

3. **ACM Certificates**

   - Automatic SSL certificate provisioning
   - DNS validation
   - Support for apex and wildcard domains

4. **Route 53 DNS**

   - DNS management for custom domains
   - A records for apex and www domains

5. **GitHub OIDC Authentication**
   - Secure authentication for GitHub Actions
   - No stored AWS credentials in GitHub
   - Environment-specific IAM roles

## Terraform Remote State Management

Our Terraform configuration uses secure remote state management with:

- **S3 Bucket**: `terraform-state-vinod-digital`

  - Versioning enabled for state history
  - Server-side encryption with AES-256
  - Public access blocked for security

- **DynamoDB Table**: `terraform-locks`
  - State locking to prevent concurrent modifications
  - PAY_PER_REQUEST billing for cost efficiency

## Multi-Environment Setup

Our infrastructure supports multiple environments through Terraform workspaces:

- **Development**:

  - Workspace: `dev`
  - State path: `env:/dev/terraform/state`
  - Domain: `dev.vinod.digital`

- **Production**:
  - Workspace: `prod`
  - State path: `env:/prod/terraform/state`
  - Domain: `vinod.digital`

## Setting Up the Infrastructure

### Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform v1.0.0 or later installed
- A registered domain name with Route 53 as the DNS provider

### Step 1: Bootstrap State Management

Before applying any Terraform configuration, set up the state management infrastructure:

```bash
cd terraform
./bootstrap_state.sh
```

This script creates:

- S3 bucket for state storage with encryption and versioning
- DynamoDB table for state locking

### Step 2: Apply Terraform Configuration

After bootstrapping, apply the Terraform configuration:

```bash
./apply_terraform.sh
```

This script will:

1. Detect your current Git branch
2. Select the appropriate workspace (dev or prod)
3. Initialize Terraform with the correct backend
4. Plan and apply the changes

### Step 3: Update GitHub Environments

After applying Terraform, update your GitHub repository with the outputs:

1. Create environments in GitHub repository settings:

   - Development
   - Production

2. Set environment variables in each environment with Terraform outputs:
   - `S3_BUCKET_NAME`
   - `CLOUDFRONT_DISTRIBUTION_ID`
   - `IAM_ROLE_ARN`

## Security Considerations

Our infrastructure implements multiple security best practices:

- **S3 Security**: Buckets block all public access; content served only through CloudFront
- **CloudFront Security**: Origin Access Control for secure S3 access
- **OIDC Security**: Short-lived credentials with repository-specific access
- **TLS Security**: Minimum TLS 1.2 protocol version
- **State Security**: Encrypted state storage with access controls

## Troubleshooting

- **Certificate Validation Issues**: Ensure your Route 53 hosted zone is properly configured
- **CloudFront Distribution Delays**: Changes to CloudFront can take 15-30 minutes to propagate
- **OIDC Authentication Failures**: Verify IAM role trust relationships match your GitHub repository

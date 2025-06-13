# GitHub OIDC Authentication for AWS

This document explains how our project uses GitHub OIDC (OpenID Connect) for secure AWS authentication from GitHub Actions workflows.

## Overview

Instead of storing long-lived AWS credentials in GitHub Secrets, we use GitHub's OIDC provider to obtain short-lived, automatically rotated credentials for AWS.

## How OIDC Authentication Works

1. GitHub provides a trusted identity based on your repository and workflow
2. AWS validates this identity using a pre-configured trust relationship
3. AWS grants temporary credentials via the `AssumeRoleWithWebIdentity` API
4. GitHub Actions workflow uses these temporary credentials to access AWS resources

## Benefits of OIDC Authentication

- **No Stored Secrets**: No AWS access keys stored in GitHub
- **Automatic Rotation**: Credentials are generated on-demand and short-lived
- **Fine-Grained Control**: Access can be limited based on repository, branch, or other conditions
- **Audit Trail**: All access is logged in AWS CloudTrail with GitHub workflow information
- **Reduced Attack Surface**: Eliminates risks associated with leaked long-term credentials

## How It's Implemented in Our Project

### 1. IAM OIDC Identity Provider

We've configured an AWS IAM OIDC identity provider that trusts GitHub's token service:

- URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

### 2. Environment-Specific IAM Roles

We've created separate IAM roles for each environment:

- **Development**:
  - Role Name: `github-actions-manage-s3-cloudfront-dev-vinod-digital`
  - Permissions: S3 access to dev bucket + CloudFront invalidations
- **Production**:
  - Role Name: `github-actions-manage-s3-cloudfront-vinod-digital`
  - Permissions: S3 access to production bucket + CloudFront invalidations

### 3. Trust Relationships

Each IAM role has a trust relationship configured to allow GitHub Actions to assume the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:vinoddotcom/ecom-learn-react:*"
        }
      }
    }
  ]
}
```

### 4. GitHub Actions Workflow Configuration

Our GitHub Actions workflow uses the `aws-actions/configure-aws-credentials` action to authenticate:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    role-to-assume: ${{ env.IAM_ROLE }}
    aws-region: ap-south-1
```

## Required GitHub Permissions

For OIDC authentication to work, the GitHub Actions workflow needs:

```yaml
permissions:
  id-token: write # Required for OIDC
  contents: read # Required to checkout code
```

## Troubleshooting

### Common Issues

1. **"Invalid identity token" error**:

   - Check that the IAM OIDC provider is correctly configured
   - Verify the audience (`aud` claim) is set to `sts.amazonaws.com`

2. **"Not authorized to perform sts:AssumeRoleWithWebIdentity" error**:

   - Check the trust relationship on the IAM role
   - Verify that the repo name in the condition exactly matches your repository

3. **"Access denied" for S3 or CloudFront**:
   - Check that the IAM role has the necessary permissions
   - Verify you're using the correct role for the environment

## Security Best Practices

1. Use conditions in trust relationships to restrict which repositories and branches can assume roles
2. Apply the principle of least privilege to IAM role permissions
3. Regularly audit IAM roles and their permissions
4. Use GitHub environment protection rules for production deployments

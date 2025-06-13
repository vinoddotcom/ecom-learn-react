# Terraform Workspace and Git Branch Binding

This document explains how the Terraform workspaces are bound to different Git branches for managing development and production environments.

## Architecture Overview

```
                   ┌─────────────────┐
                   │   Git Branches  │
                   └────────┬────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
          ┌──────▼─────┐        ┌──────▼─────┐
          │ main branch│        │ production │
          └──────┬─────┘        └──────┬─────┘
                 │                     │
                 │                     │
          ┌──────▼─────┐        ┌──────▼─────┐
          │    dev     │        │    prod    │
          │  workspace │        │  workspace │
          └──────┬─────┘        └──────┬─────┘
                 │                     │
                 │                     │
      ┌──────────▼──────────┐ ┌────────▼────────┐
      │ dev.vinod.digital   │ │  vinod.digital  │
      └─────────────────────┘ └─────────────────┘
```

## Environment-Specific Configuration

Each environment (development and production) has its own:

1. **Terraform workspace**
2. **State file path** in S3
3. **Variable values** in `terraform.tfvars`
4. **AWS resources** (S3, CloudFront, etc.)
5. **GitHub Actions IAM role**

## Branch to Workspace Mapping

| Git Branch   | Terraform Workspace | Domain            | Primary Use             |
| ------------ | ------------------- | ----------------- | ----------------------- |
| `main`       | `dev`               | dev.vinod.digital | Development and testing |
| `production` | `prod`              | vinod.digital     | Production deployment   |

## How It Works

### Workspace Selection

The workspace is selected based on the Git branch:

```bash
# From apply_terraform.sh
if [ "$BRANCH" == "production" ]; then
  WORKSPACE="prod"
else
  WORKSPACE="dev"
fi
```

### State Isolation

Each workspace has its own state file in S3:

- Development: `env:/dev/terraform/state`
- Production: `env:/prod/terraform/state`

This ensures that changes to one environment don't affect the other.

### Variable Management

Our variable management follows a two-level approach:

1. **Variable Declarations**:

   - Located in the root `variables.tf` file
   - Defines variable types and descriptions
   - Contains no default values

2. **Variable Values**:
   - Each environment has its own variable file:
     - Development: `environments/dev/terraform.tfvars`
     - Production: `environments/prod/terraform.tfvars`
   - These files specify environment-specific values like domain names and resource identifiers

This separation ensures clean variable management with environment-specific values properly isolated.

## GitHub Actions Integration

The CI/CD pipeline automatically detects the Git branch and deploys to the corresponding environment:

```yaml
if [ "${{ github.ref }}" == "refs/heads/production" ]; then
ENVIRONMENT="production"
else
ENVIRONMENT="development"
fi
```

## Workspace Management with apply_terraform.sh

Our infrastructure uses a streamlined approach with a single script that automatically detects your Git branch and applies the appropriate workspace:

```bash
./apply_terraform.sh
```

This script:

1. Detects your current Git branch (`main` or `production`)
2. Selects the appropriate workspace (`dev` or `prod`)
3. Initializes Terraform with the correct backend configuration
4. Plans and applies the changes after confirmation

```

This script:

1. Detects the current Git branch
2. Selects the appropriate workspace
3. Runs Terraform plan and apply with the correct variables

## Security Considerations

- Each environment uses its own IAM role with specific permissions
- Production resources are isolated from development resources
- Different CloudFront distributions ensure no cache collisions

## Best Practices

1. Always make changes in the development environment first
2. Test thoroughly before promoting to production
3. Use feature branches that merge into `main` for development
4. Only merge to `production` when ready for a production release
5. Avoid directly editing the `production` branch

## Resource Naming

Where possible, resources are named with environment-specific prefixes or suffixes to avoid conflicts and make identification easier:

- Development: `dev-vinod-digital-*` or `*-dev`
- Production: `vinod-digital-*` (no suffix for production)
```

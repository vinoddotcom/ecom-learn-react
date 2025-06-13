# Terraform State Management Guide

This guide expands on the information in `terraform/STATE_MANAGEMENT.md` with practical examples and troubleshooting tips.

## Overview

Our Terraform state is managed using:

- **S3 Bucket**: `terraform-state-vinod-digital`
- **DynamoDB Table**: `terraform-locks`
- **Region**: `ap-south-1`
- **Encryption**: AES-256 server-side encryption
- **Versioning**: Enabled for state history and recovery

## How State Management Is Bootstrapped

The state management infrastructure is created using the `bootstrap_state.sh` script, which:

1. Creates the S3 bucket if it doesn't exist
2. Enables versioning on the bucket
3. Configures server-side encryption
4. Blocks all public access to the bucket
5. Creates the DynamoDB table for state locking

## Workspace-Based State Organization

Each environment uses a separate workspace with its own state file path:

- **Development**: `env:/dev/terraform/state`
- **Production**: `env:/prod/terraform/state`

This separation ensures that changes to one environment don't affect the other.

## Backend Configuration

Each environment has its own backend configuration file:

**Development** (`terraform/environments/dev/backend.hcl`):

```hcl
bucket         = "terraform-state-vinod-digital"
key            = "env:/dev/terraform/state"
region         = "ap-south-1"
encrypt        = true
dynamodb_table = "terraform-locks"
```

**Production** (`terraform/environments/prod/backend.hcl`):

```hcl
bucket         = "terraform-state-vinod-digital"
key            = "env:/prod/terraform/state"
region         = "ap-south-1"
encrypt        = true
dynamodb_table = "terraform-locks"
```

## Working with State

### Initializing with the Correct Backend

```bash
# For development
terraform init -reconfigure -backend-config=./environments/dev/backend.hcl

# For production
terraform init -reconfigure -backend-config=./environments/prod/backend.hcl
```

### Selecting a Workspace

```bash
# For development
terraform workspace select dev

# For production
terraform workspace select prod
```

### Simplified Workflow with apply_terraform.sh

Our `apply_terraform.sh` script handles workspace selection automatically based on your current Git branch:

```bash
./apply_terraform.sh
```

## Handling State Emergencies

### Recovering from a Locked State

If a Terraform operation crashes and leaves the state locked:

1. Check the lock information in the DynamoDB table:

   ```bash
   aws dynamodb get-item \
     --table-name terraform-locks \
     --key '{"LockID": {"S": "terraform-state-vinod-digital/env:/dev/terraform/state-md5"}}' \
     --region ap-south-1
   ```

2. Force-unlock the state if necessary:
   ```bash
   terraform force-unlock LOCK_ID
   ```

### Recovering from Corrupted State

If state becomes corrupted, you can restore from a previous version:

1. List state file versions in S3:

   ```bash
   aws s3api list-object-versions \
     --bucket terraform-state-vinod-digital \
     --prefix env:/dev/terraform/state \
     --region ap-south-1
   ```

2. Download a specific version:

   ```bash
   aws s3api get-object \
     --bucket terraform-state-vinod-digital \
     --key env:/dev/terraform/state \
     --version-id "VERSION_ID" \
     --region ap-south-1 \
     recovered-state.tfstate
   ```

3. Use the recovered state:
   ```bash
   terraform state push recovered-state.tfstate
   ```

## Security Best Practices

1. **Never commit state files** to version control
2. **Use IAM roles** with least privilege for accessing state
3. **Enable access logging** on the S3 bucket for audit trails
4. **Regularly back up** the S3 bucket
5. **Use MFA Delete** for additional protection against accidental deletion

## Troubleshooting Common Issues

### "Error acquiring the state lock"

**Problem**: The state is locked by another operation or a crashed operation.

**Solution**:

1. Check who owns the lock using the DynamoDB table
2. If it's a stale lock, use `terraform force-unlock`
3. If it's an active lock, coordinate with the person running the operation

### "AccessDenied when calling the HeadObject operation"

**Problem**: Insufficient permissions to access the state file in S3.

**Solution**:

1. Check your AWS credentials and IAM permissions
2. Ensure you have s3:GetObject, s3:PutObject, and s3:ListBucket permissions on the bucket

### "Error loading state: state data in S3 does not have the expected content"

**Problem**: The state file might be corrupted.

**Solution**:

1. Try to recover the state from a previous version using S3 versioning
2. If that doesn't work, you may need to recreate the state file using `terraform import`

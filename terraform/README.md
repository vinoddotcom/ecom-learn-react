# React App AWS Infrastructure Automation

This repository contains Terraform and Ansible automation for deploying a React application to AWS with:

- S3 for storage
- CloudFront for content delivery
- ACM for SSL certificates
- Route 53 for DNS management
- GitHub Actions for CI/CD
- Multiple environment support (development and production)

## Architecture Overview

![Architecture Diagram](https://mermaid.ink/img/pako:eNqNksFuwjAMhl_FyrlIewA4TJM4bNIOm7TDeEROYyBaEyrHYULAu89JGDAENmUnyf_Z_u3apDEGaY1167hksmFPCqksGHlEJZMalyCksiZksq0s6O2Z_ZBziWVNJR2okwjuT2Jfo_RGZOcDjtjnXP4qXYrwgFJSfmMerelcWuTe-ySzWNVHJvd0XYpwT3-HglqPwZnm1qUhdGjRyrbFA-la6pUQlUxz0BYeref311SQ85xSlJJf4ol9KB4OK0trPB5N9h4lkGev9zN_nYasVwD1QFqPtYzsAWQGRpM-oO0wkfi_U_1wjpCVNcVBfto9rIaeSFyEXZg0WKNLwaxNGtA4vZg0onmPafRgokCOUMVwQpVF46rLofo9hhXPh_QfDV_wCw?type=png)

## Prerequisites

Before you begin, ensure you have the following installed:

- Terraform (v1.0.0 or later)
- AWS CLI configured with appropriate permissions
- Ansible (optional, for post-provisioning tasks)
- A registered domain name with Route 53 as the DNS provider

## Directory Structure

```
terraform/
├── main.tf              # Main Terraform configuration
├── variables.tf         # Input variables
├── outputs.tf           # Output values
├── environments/        # Environment-specific configurations
└── modules/
    ├── s3/              # S3 bucket configuration
    ├── acm/             # ACM certificate configuration
    ├── cloudfront/      # CloudFront distribution configuration
    ├── route53/         # Route 53 DNS records configuration
    └── github_oidc/     # GitHub OIDC IAM role configuration

ansible/
├── inventory            # Ansible inventory file
└── post_terraform.yml   # Playbook for post-Terraform tasks

.github/
└── workflows/
    └── deploy.yml       # GitHub Actions workflow for CI/CD
```

## State Management

This project uses secure Terraform state management with:

- S3 for encrypted, versioned state storage
- DynamoDB for state locking

For detailed information, see [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md).

## Multi-Environment Support

This project supports multiple environments (development and production) with:

- Separate Terraform workspaces for each environment
- Git branch-based environment selection
- Environment-specific configurations

For detailed information, see [WORKSPACE_BINDING.md](WORKSPACE_BINDING.md).

## Usage

### 1. Bootstrap State Management Infrastructure

Before initializing Terraform, set up the state management infrastructure:

```bash
cd terraform
./bootstrap_state.sh
```

### 2. Select Environment Based on Git Branch

The environment (dev or prod) is automatically selected based on your current Git branch:

```bash
./apply_terraform.sh
```

Or manually select an environment:

```bash
# For development environment
./use_dev_workspace.sh

# For production environment
./use_prod_workspace.sh
```

### 3. Plan and Apply Configuration

After selecting the workspace, plan and apply the Terraform configuration:

```bash
# If using apply_terraform.sh, this is handled automatically
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply
hosted_zone_id = "Z1234567890ABC"  # Your Route 53 Hosted Zone ID
github_org     = "vinoddotcom"      # Your GitHub organization
github_repo    = "ecom-learn-react" # Your GitHub repository name
```

### 3. Plan and Apply Terraform Configuration

```bash
terraform plan -out=tfplan
terraform apply tfplan
```

### 4. (Optional) Run Ansible Playbook for Post-Provisioning Tasks

If needed, you can use the Ansible playbook for tasks Terraform can't handle:

```bash
cd ../ansible
ansible-playbook -i inventory post_terraform.yml -e "acm_certificate_arn=<output_from_terraform> wait_for_acm_validation=true"
```

### 5. Configure GitHub Repository Secrets

Add the following secrets to your GitHub repository:

- `AWS_ROLE_ARN`: The ARN of the IAM role (output from Terraform)
- `CLOUDFRONT_DISTRIBUTION_ID`: The CloudFront distribution ID (output from Terraform)

## GitHub Actions Workflow

The GitHub Actions workflow in `.github/workflows/deploy.yml` will:

1. Build the React application
2. Run tests
3. Deploy the build to S3
4. Invalidate the CloudFront cache

The workflow is triggered automatically on pushes to the main branch or can be triggered manually.

## Terraform Resources

This automation provisions the following AWS resources:

- S3 bucket for static file storage
- CloudFront distribution with OAC for secure content delivery
- ACM SSL certificate with DNS validation
- Route 53 DNS records for domain configuration
- IAM role for GitHub Actions with OIDC authentication

## Post-Deployment

After successful deployment, your React application will be accessible at:

- `https://vinod.digital` (apex domain)
- `https://www.vinod.digital` (www subdomain)

## Security Considerations

- The S3 bucket blocks all public access; content is only served through CloudFront
- CloudFront uses OAC (Origin Access Control) to securely access the S3 bucket
- GitHub Actions uses OIDC for secure, short-lived credentials without stored AWS keys
- CloudFront enforces HTTPS with TLS 1.2

## Cleanup

To destroy all resources created by Terraform:

```bash
cd terraform
terraform destroy
```

## Troubleshooting

- **Certificate Validation Issues**: ACM certificates require DNS validation records to be correctly configured in Route 53. The Terraform configuration creates these automatically, but validation may take up to 30 minutes.
- **CloudFront Distribution Updates**: Changes to CloudFront distributions can take 15-30 minutes to propagate globally.
- **GitHub Actions OIDC Issues**: Ensure the repository name and organization match exactly what's configured in the IAM role trust relationship.

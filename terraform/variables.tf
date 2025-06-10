variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
  # No default - use environment-specific value from terraform.tfvars
}

variable "domain_name" {
  description = "The domain name for the website (e.g., vinod.digital for prod, dev.vinod.digital for dev)"
  type        = string
  # No default - use environment-specific value from terraform.tfvars
}

variable "hosted_zone_id" {
  description = "The Route 53 Hosted Zone ID for the domain"
  type        = string
  # No default - use environment-specific value from terraform.tfvars
}

variable "github_org" {
  description = "The GitHub organization name"
  type        = string
  # No default - use environment-specific value from terraform.tfvars
}

variable "github_repo" {
  description = "The GitHub repository name"
  type        = string
  # No default - use environment-specific value from terraform.tfvars
}

variable "github_role_name" {
  description = "The name for the IAM role used by GitHub Actions"
  type        = string
  # No default - use environment-specific value from terraform.tfvars
}

variable "default_tags" {
  description = "Default tags to apply to all resources"
  type        = map(string)
  # No default - use environment-specific value from terraform.tfvars
}

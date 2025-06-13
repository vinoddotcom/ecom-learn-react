variable "bucket_name" {
  description = "The name of the S3 bucket"
  type        = string
}

variable "bucket_arn" {
  description = "The ARN of the S3 bucket"
  type        = string
}

variable "cloudfront_arn" {
  description = "The ARN of the CloudFront distribution"
  type        = string
}

variable "github_org" {
  description = "The GitHub organization name"
  type        = string
}

variable "github_repo" {
  description = "The GitHub repository name"
  type        = string
}

variable "role_name" {
  description = "The name for the IAM role"
  type        = string
  default     = "github-actions-manage-s3-cloudfront"
}

variable "create_oidc_provider" {
  description = "Whether to create the OIDC provider (set to false if it already exists)"
  type        = bool
  default     = false
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "region" {
  description = "AWS region for the S3 bucket"
  type        = string
}

variable "create_bucket" {
  description = "Whether to create the S3 bucket or use an existing one"
  type        = bool
  default     = true
}

variable "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution that will access this bucket"
  type        = string
  default     = ""  # Default empty string allows for conditional creation of bucket policy
}

variable "cloudfront_oac_id" {
  description = "ID of the CloudFront Origin Access Control"
  type        = string
  default     = ""  # Default empty string allows for conditional creation of bucket policy
}


variable "github_actions_role_arn" {
  description = "ARN of the GitHub Actions IAM role that needs S3 access"
  type        = string
  default     = ""  # Default empty string allows for conditional inclusion in bucket policy
}

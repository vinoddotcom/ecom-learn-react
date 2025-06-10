variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "region" {
  description = "AWS region for the S3 bucket"
  type        = string
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

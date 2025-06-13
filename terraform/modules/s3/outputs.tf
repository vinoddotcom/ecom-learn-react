output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = local.bucket_id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = local.bucket_arn
}

output "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = var.create_bucket ? aws_s3_bucket.website_bucket[0].bucket_regional_domain_name : data.aws_s3_bucket.existing_bucket[0].bucket_regional_domain_name
}

# The OAC is now managed by the CloudFront module

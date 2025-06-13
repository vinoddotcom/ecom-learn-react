output "s3_bucket_name" {
  description = "The name of the S3 bucket"
  value       = module.s3_bucket.bucket_name
}

output "s3_bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = module.s3_bucket.bucket_arn
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = module.cloudfront.distribution_id
}

output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = module.cloudfront.domain_name
}

output "acm_certificate_arn" {
  description = "The ARN of the ACM certificate"
  value       = module.acm.certificate_arn
}

output "iam_role_arn" {
  description = "The ARN of the IAM role for GitHub Actions"
  value       = module.github_oidc.role_arn
}


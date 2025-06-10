output "distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.s3_distribution.id
}

output "domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.s3_distribution.arn
}

output "distribution" {
  description = "The CloudFront distribution object"
  value = {
    domain_name    = aws_cloudfront_distribution.s3_distribution.domain_name
    hosted_zone_id = aws_cloudfront_distribution.s3_distribution.hosted_zone_id
  }
}

output "oac_id" {
  description = "ID of the CloudFront Origin Access Control"
  value       = aws_cloudfront_origin_access_control.s3_oac.id
}

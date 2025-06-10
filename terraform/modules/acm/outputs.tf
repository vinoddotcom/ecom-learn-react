output "certificate_arn" {
  description = "The ARN of the certificate"
  value       = aws_acm_certificate.cert.arn
}

output "certificate_domain_name" {
  description = "The domain name of the certificate"
  value       = aws_acm_certificate.cert.domain_name
}

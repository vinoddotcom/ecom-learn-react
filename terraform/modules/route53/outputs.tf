output "apex_domain_record" {
  description = "The apex domain record"
  value       = aws_route53_record.apex.fqdn
}

output "www_domain_record" {
  description = "The www subdomain record"
  value       = aws_route53_record.www.fqdn
}

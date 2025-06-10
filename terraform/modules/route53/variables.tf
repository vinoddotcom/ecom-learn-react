variable "domain_name" {
  description = "The domain name for the website"
  type        = string
}

variable "cloudfront_distribution" {
  description = "The CloudFront distribution to point to"
  type        = object({
    domain_name = string
    hosted_zone_id = string
  })
}

variable "hosted_zone_id" {
  description = "The Route 53 Hosted Zone ID for the domain"
  type        = string
}

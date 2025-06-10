variable "domain_name" {
  description = "The domain name for the certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "Subject alternative names for the certificate"
  type        = list(string)
  default     = []
}

variable "hosted_zone_id" {
  description = "The Route 53 Hosted Zone ID for the domain"
  type        = string
}

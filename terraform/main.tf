terraform {
  required_version = ">= 1.0.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # The backend configuration will be specified via -backend-config flag
  backend "s3" {}
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.default_tags
  }
}

# Additional provider for ACM certificate (required to be in us-east-1 for CloudFront)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = var.default_tags
  }
}

# Module for S3 bucket
module "s3_bucket" {
  source = "./modules/s3"

  bucket_name = var.domain_name
  region      = var.aws_region
}

# Module for ACM certificate
module "acm" {
  source = "./modules/acm"

  providers = {
    aws = aws.us_east_1
  }

  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  hosted_zone_id            = var.hosted_zone_id
}

# Module for CloudFront distribution
module "cloudfront" {
  source = "./modules/cloudfront"

  depends_on = [module.s3_bucket, module.acm]

  domain_name        = var.domain_name
  bucket_name        = module.s3_bucket.bucket_name
  bucket_regional_domain_name = module.s3_bucket.bucket_regional_domain_name
  acm_certificate_arn = module.acm.certificate_arn
}

# Module for Route 53 DNS records
module "route53" {
  source = "./modules/route53"

  depends_on = [module.cloudfront]

  domain_name             = var.domain_name
  cloudfront_distribution = module.cloudfront.distribution
  hosted_zone_id          = var.hosted_zone_id
}

# Update S3 bucket policy after CloudFront distribution is created
module "s3_bucket_policy" {
  source = "./modules/s3"

  depends_on = [module.s3_bucket, module.cloudfront]

  bucket_name                = var.domain_name
  region                     = var.aws_region
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
  cloudfront_oac_id          = module.cloudfront.oac_id
}

# Module for GitHub OIDC IAM Role
module "github_oidc" {
  source = "./modules/github_oidc"

  bucket_name            = module.s3_bucket.bucket_name
  bucket_arn             = module.s3_bucket.bucket_arn
  cloudfront_arn         = module.cloudfront.distribution_arn
  github_org             = var.github_org
  github_repo            = var.github_repo
  role_name              = var.github_role_name
}

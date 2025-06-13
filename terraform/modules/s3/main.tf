resource "aws_s3_bucket" "website_bucket" {
  # Only create the bucket if we are not in a policy-only mode
  count  = var.create_bucket ? 1 : 0
  bucket = var.bucket_name

  # Prevent accidental deletion of this S3 bucket
  lifecycle {
    prevent_destroy = true
  }
}

# Use data source to reference the bucket if not creating it
data "aws_s3_bucket" "existing_bucket" {
  count  = var.create_bucket ? 0 : 1
  bucket = var.bucket_name
}

# For referencing either the created bucket or existing one
locals {
  bucket_id  = var.create_bucket ? aws_s3_bucket.website_bucket[0].id : data.aws_s3_bucket.existing_bucket[0].id
  bucket_arn = var.create_bucket ? aws_s3_bucket.website_bucket[0].arn : data.aws_s3_bucket.existing_bucket[0].arn
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "website_bucket" {
  count  = var.create_bucket ? 1 : 0
  bucket = local.bucket_id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Disable versioning as per requirements
resource "aws_s3_bucket_versioning" "website_bucket" {
  count  = var.create_bucket ? 1 : 0
  bucket = local.bucket_id
  versioning_configuration {
    status = "Disabled"
  }
}

# Create bucket policy to allow CloudFront OAC access only
resource "aws_s3_bucket_policy" "website_bucket" {
  bucket = local.bucket_id
  policy = data.aws_iam_policy_document.s3_policy.json
}

# Define the policy document with conditional statement based on CloudFront distribution
data "aws_iam_policy_document" "s3_policy" {
  # Statement for CloudFront access
  dynamic "statement" {
    for_each = var.cloudfront_distribution_arn != "" ? [1] : []
    content {
      actions   = ["s3:GetObject"]
      resources = ["${local.bucket_arn}/*"]

      principals {
        type        = "Service"
        identifiers = ["cloudfront.amazonaws.com"]
      }

      # Only add the condition if CloudFront distribution ARN is provided
      condition {
        test     = "StringEquals"
        variable = "AWS:SourceArn"
        values   = [var.cloudfront_distribution_arn]
      }
    }
  }
  
  # Default statement to deny public access if CloudFront ARN is not provided
  dynamic "statement" {
    for_each = var.cloudfront_distribution_arn == "" ? [1] : []
    content {
      effect    = "Deny"
      actions   = ["s3:*"]
      resources = ["${local.bucket_arn}/*"]
      
      principals {
        type        = "*"
        identifiers = ["*"]
      }
      
      condition {
        test     = "Bool"
        variable = "aws:SecureTransport"
        values   = ["false"]
      }
    }
  }
  
  # Conditional statement for GitHub Actions IAM role
  dynamic "statement" {
    for_each = var.github_actions_role_arn != "" ? [1] : []
    content {
      actions = [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:DeleteObject",
        "s3:ListBucket"
      ]
      resources = [
        local.bucket_arn,
        "${local.bucket_arn}/*"
      ]
      
      principals {
        type        = "AWS"
        identifiers = [var.github_actions_role_arn]
      }
    }
  }
}

# Get the current AWS account ID
data "aws_caller_identity" "current" {}

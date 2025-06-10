resource "aws_s3_bucket" "website_bucket" {
  bucket = var.bucket_name

  # Prevent accidental deletion of this S3 bucket
  lifecycle {
    prevent_destroy = true
  }
}

# Block all public access
resource "aws_s3_bucket_public_access_block" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Disable versioning as per requirements
resource "aws_s3_bucket_versioning" "website_bucket" {
  bucket = aws_s3_bucket.website_bucket.id
  versioning_configuration {
    status = "Disabled"
  }
}

# Create bucket policy to allow CloudFront OAC access only - conditional on CloudFront ARN being provided
resource "aws_s3_bucket_policy" "website_bucket" {
  count  = var.cloudfront_distribution_arn != "" ? 1 : 0
  bucket = aws_s3_bucket.website_bucket.id
  policy = data.aws_iam_policy_document.s3_policy.json
}

# Define the policy document - only created when CloudFront distribution ARN is provided
data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.website_bucket.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    # Only add the condition if CloudFront distribution ARN is provided
    dynamic "condition" {
      for_each = var.cloudfront_distribution_arn != "" ? [1] : []
      content {
        test     = "StringEquals"
        variable = "AWS:SourceArn"
        values   = [var.cloudfront_distribution_arn]
      }
    }
  }
}

# Get the current AWS account ID
data "aws_caller_identity" "current" {}

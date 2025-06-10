# Create the GitHub OIDC provider if it doesn't exist
resource "aws_iam_openid_connect_provider" "github_actions" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# Create S3 deployment policy
resource "aws_iam_policy" "s3_deployment" {
  name        = "${var.role_name}-s3-policy"
  description = "Policy for deploying to S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl",
          "s3:DeleteObject"
        ]
        Resource = "${var.bucket_arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = var.bucket_arn
      }
    ]
  })
}

# Create CloudFront invalidation policy
resource "aws_iam_policy" "cloudfront_invalidation" {
  name        = "${var.role_name}-cloudfront-policy"
  description = "Policy for creating CloudFront invalidations"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "cloudfront:CreateInvalidation"
        Resource = "*"
      }
    ]
  })
}

# Create IAM role for GitHub Actions
resource "aws_iam_role" "github_actions" {
  name = var.role_name

  # Trust relationship policy for GitHub OIDC
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github_actions.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}/${var.github_repo}:*"
          }
        }
      }
    ]
  })
}

# Attach S3 deployment policy to the role
resource "aws_iam_role_policy_attachment" "s3_deployment" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.s3_deployment.arn
}

# Attach CloudFront invalidation policy to the role
resource "aws_iam_role_policy_attachment" "cloudfront_invalidation" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.cloudfront_invalidation.arn
}

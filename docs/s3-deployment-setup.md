# S3 Deployment Setup Guide

This document provides instructions for setting up the AWS resources and GitHub repository secrets necessary for the CI/CD pipeline to deploy to an S3 bucket.

## AWS Setup

### 1. Create an S3 Bucket

1. Log in to the AWS Management Console
2. Navigate to S3
3. Create a new bucket with a unique name
4. Configure the bucket for static website hosting:
   - Go to the bucket properties
   - Enable "Static website hosting"
   - Set "Index document" to `index.html`
   - Set "Error document" to `index.html` (for handling client-side routing)

### 2. Set Bucket Permissions

1. Add a bucket policy to allow public read access (if this is a public website):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

2. Enable CORS if needed:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Create an IAM User for Deployments

1. Go to the IAM service in AWS
2. Create a new user
3. Create and attach a policy with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": ["arn:aws:s3:::YOUR-BUCKET-NAME"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::YOUR-BUCKET-NAME/*"]
    }
  ]
}
```

4. Generate and securely store the Access Key ID and Secret Access Key

### 4. (Optional) Set Up CloudFront Distribution

If you want to use CloudFront as a CDN in front of your S3 bucket:

1. Create a CloudFront distribution pointing to your S3 bucket
2. Add the following permission to the IAM user's policy:

```json
{
  "Effect": "Allow",
  "Action": ["cloudfront:CreateInvalidation"],
  "Resource": ["arn:aws:cloudfront::YOUR-ACCOUNT-ID:distribution/YOUR-DISTRIBUTION-ID"]
}
```

## GitHub Repository Setup

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and Variables > Actions
3. Add the following repository secrets:

- `AWS_ACCESS_KEY_ID`: The Access Key ID of the IAM user you created
- `AWS_SECRET_ACCESS_KEY`: The Secret Access Key of the IAM user
- `AWS_REGION`: The region where your S3 bucket is located (e.g., `us-east-1`)
- `S3_BUCKET`: The name of your S3 bucket
- `CLOUDFRONT_DISTRIBUTION_ID`: (Optional) Your CloudFront distribution ID if you're using CloudFront

## Testing The Pipeline

1. Make a commit to your main branch
2. Go to the "Actions" tab in your GitHub repository
3. You should see the workflow running
4. Once completed successfully, your application should be deployed to the S3 bucket

## Accessing Your Deployed Application

If you've set up the S3 bucket for static website hosting, you can access your application at:

`http://YOUR-BUCKET-NAME.s3-website-YOUR-REGION.amazonaws.com`

Or if you're using CloudFront:

`https://YOUR-CLOUDFRONT-DOMAIN.cloudfront.net`

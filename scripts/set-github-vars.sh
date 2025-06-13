#!/usr/bin/env bash
# Script to extract Terraform outputs and set them as GitHub environment variables
# Requires GitHub CLI (gh) to be installed and authenticated

set -e

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists gh; then
  echo "Error: GitHub CLI (gh) is not installed. Please install it first."
  echo "See https://github.com/cli/cli#installation for installation instructions."
  exit 1
fi

if ! command_exists terraform; then
  echo "Error: Terraform is not installed. Please install it first."
  exit 1
fi

if ! command_exists jq; then
  echo "Error: jq is not installed. Please install it first."
  exit 1
fi

# Check if logged in to GitHub
if ! gh auth status >/dev/null 2>&1; then
  echo "Error: Not logged in to GitHub. Please run 'gh auth login' first."
  exit 1
fi

# Parse arguments
ENV="dev"
REPO=""

print_usage() {
  echo "Usage: $0 -e <environment> -r <owner/repo>"
  echo "  -e  Environment (dev or prod)"
  echo "  -r  GitHub repository in the format owner/repo"
}

while getopts "e:r:h" opt; do
  case $opt in
    e) ENV="$OPTARG" ;;
    r) REPO="$OPTARG" ;;
    h) print_usage; exit 0 ;;
    *) print_usage; exit 1 ;;
  esac
done

# Validate inputs
if [[ "$ENV" != "dev" && "$ENV" != "prod" ]]; then
  echo "Error: Environment must be either 'dev' or 'prod'"
  print_usage
  exit 1
fi

if [[ -z "$REPO" ]]; then
  echo "Error: GitHub repository must be specified with -r option"
  print_usage
  exit 1
fi

echo "Setting up GitHub variables for $ENV environment in repository $REPO"

# Navigate to Terraform directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../terraform"
cd "$TERRAFORM_DIR"

# Select the right workspace
if [[ "$ENV" == "dev" ]]; then
  echo "Selecting dev workspace..."
  terraform workspace select dev || terraform workspace new dev
else
  echo "Selecting prod workspace..."
  terraform workspace select prod || terraform workspace new prod
fi

# Get Terraform outputs
echo "Extracting Terraform outputs..."
OUTPUT_JSON=$(terraform output -json)

# Extract values
S3_BUCKET_NAME=$(echo "$OUTPUT_JSON" | jq -r '.s3_bucket_name.value')
S3_BUCKET_ARN=$(echo "$OUTPUT_JSON" | jq -r '.s3_bucket_arn.value')
CLOUDFRONT_DISTRIBUTION_ID=$(echo "$OUTPUT_JSON" | jq -r '.cloudfront_distribution_id.value')
IAM_ROLE_ARN=$(echo "$OUTPUT_JSON" | jq -r '.iam_role_arn.value')
CLOUDFRONT_DOMAIN_NAME=$(echo "$OUTPUT_JSON" | jq -r '.cloudfront_domain_name.value')
ACM_CERTIFICATE_ARN=$(echo "$OUTPUT_JSON" | jq -r '.acm_certificate_arn.value')

# Set GitHub environment and variables
if [[ "$ENV" == "dev" ]]; then
  ENV_NAME="development"
  PREFIX=""
else
  ENV_NAME="production"
  PREFIX=""
fi

# Check if environment exists, create if not
if ! gh api "repos/$REPO/environments/$ENV_NAME" >/dev/null 2>&1; then
  echo "Creating $ENV_NAME environment in GitHub..."
  gh api --silent "repos/$REPO/environments/$ENV_NAME" -X PUT
fi

# Set variables in GitHub environment
echo "Setting GitHub variables for $ENV_NAME environment..."
gh variable set S3_BUCKET_NAME -b "$S3_BUCKET_NAME" --env "$ENV_NAME" --repo "$REPO"
gh variable set CLOUDFRONT_DISTRIBUTION_ID -b "$CLOUDFRONT_DISTRIBUTION_ID" --env "$ENV_NAME" --repo "$REPO"
gh variable set IAM_ROLE_ARN -b "$IAM_ROLE_ARN" --env "$ENV_NAME" --repo "$REPO"
gh variable set CLOUDFRONT_DOMAIN_NAME -b "$CLOUDFRONT_DOMAIN_NAME" --env "$ENV_NAME" --repo "$REPO"

echo "-------------------------------------------------------"
echo "✅ GitHub variables set successfully for $ENV_NAME environment"
echo ""
echo "S3_BUCKET_NAME: $S3_BUCKET_NAME"
echo "CLOUDFRONT_DISTRIBUTION_ID: $CLOUDFRONT_DISTRIBUTION_ID"
echo "IAM_ROLE_ARN: $IAM_ROLE_ARN"
echo "CLOUDFRONT_DOMAIN_NAME: $CLOUDFRONT_DOMAIN_NAME"
echo "-------------------------------------------------------"

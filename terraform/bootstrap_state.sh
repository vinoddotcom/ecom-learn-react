#!/bin/bash
set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="terraform-state-vinod-digital"
TABLE_NAME="terraform-locks"
REGION="ap-south-1"

echo -e "${YELLOW}Starting Terraform state management bootstrap...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}AWS credentials are not configured or invalid. Please configure with 'aws configure'.${NC}"
    exit 1
fi
echo -e "${GREEN}AWS credentials validated.${NC}"

# Create S3 bucket for Terraform state if it doesn't exist
echo -e "${YELLOW}Checking if S3 bucket exists...${NC}"
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo -e "${YELLOW}Creating S3 bucket for Terraform state: $BUCKET_NAME${NC}"
    aws s3api create-bucket \
        --bucket "$BUCKET_NAME" \
        --region "$REGION" \
        --create-bucket-configuration LocationConstraint="$REGION"
    
    # Enable versioning
    echo -e "${YELLOW}Enabling bucket versioning...${NC}"
    aws s3api put-bucket-versioning \
        --bucket "$BUCKET_NAME" \
        --versioning-configuration Status=Enabled

    # Enable encryption
    echo -e "${YELLOW}Enabling default encryption...${NC}"
    aws s3api put-bucket-encryption \
        --bucket "$BUCKET_NAME" \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'

    # Block public access
    echo -e "${YELLOW}Blocking public access...${NC}"
    aws s3api put-public-access-block \
        --bucket "$BUCKET_NAME" \
        --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
else
    echo -e "${GREEN}S3 bucket $BUCKET_NAME already exists.${NC}"
fi

# Create DynamoDB table for state locking if it doesn't exist
echo -e "${YELLOW}Checking if DynamoDB table exists...${NC}"
if ! aws dynamodb describe-table --table-name "$TABLE_NAME" &>/dev/null; then
    echo -e "${YELLOW}Creating DynamoDB table for state locking: $TABLE_NAME${NC}"
    aws dynamodb create-table \
        --table-name "$TABLE_NAME" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$REGION"

    echo -e "${YELLOW}Waiting for DynamoDB table to become active...${NC}"
    aws dynamodb wait table-exists --table-name "$TABLE_NAME"
else
    echo -e "${GREEN}DynamoDB table $TABLE_NAME already exists.${NC}"
fi

echo -e "${GREEN}Terraform state management infrastructure is ready!${NC}"
echo -e "${GREEN}You can now run 'terraform init' to initialize your Terraform configuration.${NC}"

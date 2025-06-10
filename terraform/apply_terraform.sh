#!/bin/bash
set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the current Git branch
BRANCH=$(git branch --show-current)

# Default to development if not on production branch
if [ "$BRANCH" == "production" ]; then
  WORKSPACE="prod"
else
  WORKSPACE="dev"
fi

ENVIRONMENT_DIR="./environments/${WORKSPACE}"

echo -e "${YELLOW}Current Git branch: ${BRANCH}${NC}"
echo -e "${YELLOW}Using Terraform workspace: ${WORKSPACE}${NC}"

# Ensure we have the latest code
echo -e "${YELLOW}Ensuring we have the latest code...${NC}"
git pull

# Initialize Terraform with the appropriate backend configuration
echo -e "${YELLOW}Initializing Terraform with ${WORKSPACE} backend configuration...${NC}"
terraform init -reconfigure -backend-config="${ENVIRONMENT_DIR}/backend.hcl"

# Select or create the workspace
echo -e "${YELLOW}Selecting ${WORKSPACE} workspace...${NC}"
terraform workspace select ${WORKSPACE} || terraform workspace new ${WORKSPACE}

# Show the current workspace
echo -e "${GREEN}Current workspace: $(terraform workspace show)${NC}"
echo -e "${GREEN}Using variables from: ${ENVIRONMENT_DIR}/terraform.tfvars${NC}"

# Run Terraform plan
echo -e "${YELLOW}Running Terraform plan...${NC}"
terraform plan -var-file="${ENVIRONMENT_DIR}/terraform.tfvars" -out=tfplan

# Ask for confirmation before applying
read -p "Do you want to apply these changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Applying Terraform changes...${NC}"
    terraform apply tfplan
    echo -e "${GREEN}Terraform changes applied successfully!${NC}"
else
    echo -e "${YELLOW}Terraform apply canceled.${NC}"
fi

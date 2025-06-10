#!/bin/bash
set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script to initialize and select the prod workspace
WORKSPACE="prod"
ENVIRONMENT_DIR="./environments/${WORKSPACE}"

echo -e "${YELLOW}Initializing Terraform with ${WORKSPACE} backend configuration...${NC}"

# Initialize Terraform with the prod backend configuration
terraform init -reconfigure -backend-config="${ENVIRONMENT_DIR}/backend.hcl"

# Select or create the prod workspace
echo -e "${YELLOW}Selecting ${WORKSPACE} workspace...${NC}"
terraform workspace select ${WORKSPACE} || terraform workspace new ${WORKSPACE}

# Show the current workspace
echo -e "${GREEN}Current workspace: $(terraform workspace show)${NC}"
echo -e "${GREEN}Using variables from: ${ENVIRONMENT_DIR}/terraform.tfvars${NC}"
echo -e "${YELLOW}Ready to run Terraform commands for ${WORKSPACE} environment${NC}"
echo -e "${YELLOW}Example: terraform plan -var-file=${ENVIRONMENT_DIR}/terraform.tfvars${NC}"

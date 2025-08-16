#!/bin/bash

# Aptos Voting App Deployment Script
# This script deploys the voting smart contract to Aptos networks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PACKAGE_NAME="voting"
NETWORK=${1:-testnet} # Default to testnet if no network specified

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if aptos CLI is installed
    if ! command -v aptos &> /dev/null; then
        print_error "Aptos CLI is not installed. Please install it first:"
        echo "curl -fsSL \"https://aptos.dev/scripts/install_cli.py\" | python3"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "Move.toml" ]; then
        print_error "Move.toml not found. Please run this script from the project root directory."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to build the contract
build_contract() {
    print_status "Building Move contract..."
    
    if aptos move build; then
        print_success "Contract built successfully"
    else
        print_error "Failed to build contract"
        exit 1
    fi
}

# Function to check account status
check_account() {
    print_status "Checking account status..."
    
    local account_address=$(aptos account list --query account --output table | grep -o '0x[a-fA-F0-9]*' | head -1)
    
    if [ -z "$account_address" ]; then
        print_error "No account found. Please create an account first:"
        echo "aptos init --profile default"
        exit 1
    fi
    
    print_success "Account found: $account_address"
    echo "$account_address" > .account_address
}

# Function to fund account (testnet only)
fund_account() {
    if [ "$NETWORK" = "testnet" ]; then
        print_status "Funding account on testnet..."
        
        local account_address=$(cat .account_address)
        
        if aptos account fund-with-faucet --account $account_address; then
            print_success "Account funded successfully"
        else
            print_warning "Failed to fund account. You may need to fund manually."
        fi
    fi
}

# Function to deploy contract
deploy_contract() {
    print_status "Deploying contract to $NETWORK..."
    
    local account_address=$(cat .account_address)
    local network_flag=""
    
    if [ "$NETWORK" = "mainnet" ]; then
        network_flag="--network mainnet"
    elif [ "$NETWORK" = "testnet" ]; then
        network_flag="--network testnet"
    fi
    
    if aptos move publish --named-addresses $PACKAGE_NAME=$account_address $network_flag; then
        print_success "Contract deployed successfully to $NETWORK"
        print_success "Contract address: $account_address"
        print_success "Module: $account_address::$PACKAGE_NAME::polls"
        
        # Save deployment info
        cat > .deployment_info << EOF
NETWORK=$NETWORK
CONTRACT_ADDRESS=$account_address
MODULE_PATH=$account_address::$PACKAGE_NAME::polls
DEPLOYMENT_TIME=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
EOF
        
    else
        print_error "Failed to deploy contract"
        exit 1
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    local account_address=$(cat .account_address)
    
    if aptos move view --function $account_address::$PACKAGE_NAME::polls::get_poll_count $network_flag; then
        print_success "Contract verification successful"
    else
        print_warning "Contract verification failed. The contract may still be deploying."
    fi
}

# Function to update configuration files
update_config() {
    print_status "Updating configuration files..."
    
    local account_address=$(cat .account_address)
    
    # Update Move.toml
    if [ -f "Move.toml" ]; then
        sed -i.bak "s/voting = \"_\"/voting = \"$account_address\"/" Move.toml
        print_success "Updated Move.toml"
    fi
    
    # Update frontend service
    if [ -f "src/services/votingService.ts" ]; then
        sed -i.bak "s/const MODULE_ADDRESS = '0x1';/const MODULE_ADDRESS = '$account_address';/" src/services/votingService.ts
        print_success "Updated votingService.ts"
    fi
    
    # Create deployment summary
    cat > DEPLOYMENT_SUMMARY.md << EOF
# Deployment Summary

## Network: $NETWORK
## Contract Address: $account_address
## Module Path: $account_address::$PACKAGE_NAME::polls
## Deployment Time: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Next Steps:

1. **Update Frontend**: The frontend service has been updated with the new contract address
2. **Test Contract**: Run some test transactions to verify functionality
3. **Start Frontend**: Run \`npm start\` to start the React application
4. **Monitor**: Use Aptos Explorer to monitor contract activity

## Contract Functions:

- \`create_poll(title, description, options, duration_seconds)\`
- \`cast_vote(poll_id, option_index)\`
- \`close_poll(poll_id)\`
- \`get_all_polls()\`
- \`get_poll_by_id(poll_id)\`

## Explorer Links:

- **Testnet**: https://explorer.aptoslabs.com/account/$account_address?network=testnet
- **Mainnet**: https://explorer.aptoslabs.com/account/$account_address?network=mainnet
EOF
    
    print_success "Created DEPLOYMENT_SUMMARY.md"
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    
    if [ -f ".account_address" ]; then
        rm .account_address
    fi
    
    if [ -f ".deployment_info" ]; then
        rm .deployment_info
    fi
    
    print_success "Cleanup completed"
}

# Main deployment flow
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Aptos Voting App Deployment${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    print_status "Starting deployment to $NETWORK network"
    echo ""
    
    check_prerequisites
    build_contract
    check_account
    fund_account
    deploy_contract
    verify_deployment
    update_config
    
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}  Deployment Completed!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo "Check DEPLOYMENT_SUMMARY.md for next steps"
    echo ""
    echo "To start the frontend:"
    echo "  npm install"
    echo "  npm start"
    echo ""
}

# Handle script arguments
case "$NETWORK" in
    testnet|mainnet)
        main
        ;;
    *)
        print_error "Invalid network. Use 'testnet' or 'mainnet'"
        echo "Usage: $0 [testnet|mainnet]"
        echo "Default: testnet"
        exit 1
        ;;
esac 
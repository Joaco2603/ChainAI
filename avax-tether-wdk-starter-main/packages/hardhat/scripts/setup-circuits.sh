#!/bin/bash

# Script to set up ZK circuits environment
# This installs circom compiler and prepares the environment

set -e

echo "========================================="
echo "Setting up ZK Circuits Environment"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if circom is installed
if ! command -v circom &> /dev/null
then
    echo -e "${YELLOW}Circom not found. Installing circom...${NC}"
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Installing circom for Linux..."
        curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
        source $HOME/.cargo/env
        
        # Clone and build circom
        git clone https://github.com/iden3/circom.git /tmp/circom
        cd /tmp/circom
        cargo build --release
        cargo install --path circom
        cd -
        
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Installing circom for macOS..."
        # Install rust if not present
        if ! command -v cargo &> /dev/null; then
            curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
            source $HOME/.cargo/env
        fi
        
        # Clone and build circom
        git clone https://github.com/iden3/circom.git /tmp/circom
        cd /tmp/circom
        cargo build --release
        cargo install --path circom
        cd -
    else
        echo -e "${YELLOW}Unsupported OS. Please install circom manually from https://docs.circom.io/getting-started/installation/${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Circom installed successfully!${NC}"
else
    echo -e "${GREEN}Circom is already installed.${NC}"
    circom --version
fi

# Create necessary directories
echo -e "\n${YELLOW}Creating directory structure...${NC}"
mkdir -p zkproof/keys/input_verifier
mkdir -p zkproof/keys/output_verifier
mkdir -p zkproof/input
mkdir -p zkproof/output
mkdir -p contracts/verifiers

echo -e "${GREEN}Directory structure created.${NC}"

# Download powers of tau (needed for trusted setup)
echo -e "\n${YELLOW}Downloading Powers of Tau...${NC}"
if [ ! -f zkproof/keys/powersOfTau28_hez_final_14.ptau ]; then
    wget -O zkproof/keys/powersOfTau28_hez_final_14.ptau \
        https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau
    echo -e "${GREEN}Powers of Tau downloaded.${NC}"
else
    echo -e "${GREEN}Powers of Tau already exists.${NC}"
fi

echo -e "\n${GREEN}========================================="
echo "Setup complete!"
echo "=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Run 'yarn zk:compile' to compile circuits"
echo "2. Run 'yarn zk:generate-verifiers' to generate Solidity verifiers"
echo ""


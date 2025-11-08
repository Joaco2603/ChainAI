#!/bin/bash

# Script to generate Solidity verifiers from compiled circuits

set -e

echo "========================================="
echo "Generating Solidity Verifiers"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

KEYS_DIR="zkproof/keys"
VERIFIERS_DIR="contracts/verifiers"

# Create verifiers directory
mkdir -p "$VERIFIERS_DIR"

# Function to generate verifier
generate_verifier() {
    local circuit_name=$1
    local zkey_file="$KEYS_DIR/${circuit_name}/${circuit_name}_0001.zkey"
    local verifier_file="$VERIFIERS_DIR/${circuit_name}_verifier.sol"
    
    echo -e "\n${YELLOW}Generating verifier for: ${circuit_name}${NC}"
    
    if [ ! -f "$zkey_file" ]; then
        echo -e "${YELLOW}Proving key not found. Compiling circuits first...${NC}"
        bash scripts/compile-circuits.sh
        return
    fi
    
    npx snarkjs zkey export solidityverifier \
        "$zkey_file" \
        "$verifier_file"
    
    # Capitalize contract name for consistency
    local contract_name="${circuit_name^}Verifier"
    sed -i.bak "s/contract Groth16Verifier/contract ${contract_name}/" "$verifier_file" 2>/dev/null || \
    sed -i '' "s/contract Groth16Verifier/contract ${contract_name}/" "$verifier_file" 2>/dev/null || true
    rm -f "${verifier_file}.bak"
    
    echo -e "${GREEN}✓ Verifier generated: $verifier_file${NC}"
}

# Generate verifiers for both circuits
generate_verifier "input_verifier"
generate_verifier "output_verifier"

echo -e "\n${GREEN}========================================="
echo "Verifier generation complete!"
echo "=========================================${NC}"
echo ""
echo "Solidity verifiers created in: $VERIFIERS_DIR"
echo ""


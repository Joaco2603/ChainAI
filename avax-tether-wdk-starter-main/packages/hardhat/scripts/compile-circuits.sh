#!/bin/bash

# Script to compile ZK circuits and generate proving/verification keys

set -e

echo "========================================="
echo "Compiling ZK Circuits"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CIRCUITS_DIR="circuits"
KEYS_DIR="zkproof/keys"
PTAU_FILE="$KEYS_DIR/powersOfTau28_hez_final_14.ptau"

# Check if Powers of Tau exists
if [ ! -f "$PTAU_FILE" ]; then
    echo -e "${YELLOW}Powers of Tau not found. Running setup...${NC}"
    bash scripts/setup-circuits.sh
fi

# Function to compile a circuit
compile_circuit() {
    local circuit_name=$1
    local circuit_file="$CIRCUITS_DIR/${circuit_name}.circom"
    local output_dir="$KEYS_DIR/$circuit_name"
    
    echo -e "\n${BLUE}=========================================${NC}"
    echo -e "${BLUE}Compiling: ${circuit_name}${NC}"
    echo -e "${BLUE}=========================================${NC}"
    
    # Step 1: Compile circuit
    echo -e "\n${YELLOW}1. Compiling circuit to R1CS...${NC}"
    circom "$circuit_file" --r1cs --wasm --sym --c -o "$output_dir"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error compiling circuit${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Circuit compiled successfully${NC}"
    
    # Step 2: Generate witness calculator info
    echo -e "\n${YELLOW}2. Generating witness calculator...${NC}"
    echo -e "${GREEN}✓ Witness calculator generated${NC}"
    
    # Step 3: Trusted setup - Phase 1
    echo -e "\n${YELLOW}3. Running trusted setup (Phase 1)...${NC}"
    npx snarkjs groth16 setup \
        "$output_dir/${circuit_name}.r1cs" \
        "$PTAU_FILE" \
        "$output_dir/${circuit_name}_0000.zkey"
    
    echo -e "${GREEN}✓ Phase 1 complete${NC}"
    
    # Step 4: Contribute to phase 2 ceremony
    echo -e "\n${YELLOW}4. Contributing to Phase 2 ceremony...${NC}"
    npx snarkjs zkey contribute \
        "$output_dir/${circuit_name}_0000.zkey" \
        "$output_dir/${circuit_name}_0001.zkey" \
        --name="First contribution" \
        -v \
        -e="$(date +%s)"
    
    echo -e "${GREEN}✓ Phase 2 contribution complete${NC}"
    
    # Step 5: Export verification key
    echo -e "\n${YELLOW}5. Exporting verification key...${NC}"
    npx snarkjs zkey export verificationkey \
        "$output_dir/${circuit_name}_0001.zkey" \
        "$output_dir/verification_key.json"
    
    echo -e "${GREEN}✓ Verification key exported${NC}"
    
    # Step 6: Generate Solidity verifier
    echo -e "\n${YELLOW}6. Generating Solidity verifier...${NC}"
    npx snarkjs zkey export solidityverifier \
        "$output_dir/${circuit_name}_0001.zkey" \
        "contracts/verifiers/${circuit_name}_verifier.sol"
    
    echo -e "${GREEN}✓ Solidity verifier generated${NC}"
    
    # Clean up intermediate files
    rm "$output_dir/${circuit_name}_0000.zkey"
    
    echo -e "\n${GREEN}=========================================${NC}"
    echo -e "${GREEN}${circuit_name} compilation complete!${NC}"
    echo -e "${GREEN}=========================================${NC}"
}

# Compile both circuits
compile_circuit "input_verifier"
compile_circuit "output_verifier"

echo -e "\n${GREEN}========================================="
echo "All circuits compiled successfully!"
echo "=========================================${NC}"
echo ""
echo "Generated files:"
echo "  - R1CS files: zkproof/keys/*/[circuit_name].r1cs"
echo "  - WASM files: zkproof/keys/*/[circuit_name]_js/"
echo "  - Proving keys: zkproof/keys/*/[circuit_name]_0001.zkey"
echo "  - Verification keys: zkproof/keys/*/verification_key.json"
echo "  - Solidity verifiers: contracts/verifiers/[circuit_name]_verifier.sol"
echo ""


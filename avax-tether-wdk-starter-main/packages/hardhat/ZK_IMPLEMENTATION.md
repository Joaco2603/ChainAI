# Zero-Knowledge Proof Implementation for ChainAI

## Overview

This implementation adds **Zero-Knowledge (ZK) proof verification** to the ChainAI platform using **SnarkJS** and **Circom**. ZK proofs enable privacy-preserving verification of model inputs and outputs without revealing the actual data on-chain.

## Table of Contents

- [Architecture](#architecture)
- [Components](#components)
- [Setup Instructions](#setup-instructions)
- [Usage Guide](#usage-guide)
- [Circuit Specifications](#circuit-specifications)
- [Smart Contracts](#smart-contracts)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

---

## Architecture

### High-Level Flow

```
User Input → Generate ZK Proof → Verify Proof On-Chain → Execute Model → Generate Output Proof → Verify Output
```

### Components Interaction

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   User/AI   │─────→│  ZK Circuits │─────→│ Solidity        │
│   Model     │      │  (Circom)    │      │ Verifiers       │
└─────────────┘      └──────────────┘      └─────────────────┘
      │                                              │
      │                                              ↓
      │                                     ┌─────────────────┐
      └────────────────────────────────────→│ ModelRegistryZK │
                                            └─────────────────┘
```

---

## Components

### 1. Circom Circuits

Located in: `circuits/`

#### **input_verifier.circom**
- **Purpose**: Verify input data integrity and constraints without revealing the input
- **Features**:
  - Hash verification using Poseidon
  - Range checking (min/max values)
  - Format validation
  - Supports up to 10 input values (configurable)

#### **output_verifier.circom**
- **Purpose**: Verify model output validity without revealing computation details
- **Features**:
  - Output range verification
  - Model ID binding (proves output came from specific model)
  - Model secret integration (prevents output forgery)
  - Probability distribution validation

### 2. Smart Contracts

Located in: `contracts/`

#### **ModelRegistryZK.sol**
Main contract extending `ModelRegistry` with ZK capabilities:
- Input/output proof verification
- Verifier contract integration
- Batch verification support
- Privacy-preserving model execution

#### **Verifier Contracts** (Auto-generated)
Located in: `contracts/verifiers/`
- `input_verifier_verifier.sol` - Verifies input proofs
- `output_verifier_verifier.sol` - Verifies output proofs

### 3. Utility Scripts

Located in: `scripts/`

- **setup-circuits.sh** - Install circom and setup environment
- **compile-circuits.sh** - Compile circuits and generate keys
- **generate-verifiers.sh** - Generate Solidity verifiers
- **zkUtils.ts** - TypeScript utilities for proof generation
- **test-zk-proof.ts** - End-to-end testing script

### 4. Deployment Scripts

Located in: `deploy/`

- **01_deploy_zk_contracts.ts** - Deploy ZK contracts to blockchain

---

## Setup Instructions

### Prerequisites

- Node.js >= 16
- Yarn or npm
- Rust (for circom compilation)
- 8GB+ RAM (for circuit compilation)

### Step 1: Install Dependencies

```bash
cd packages/hardhat
yarn install
```

### Step 2: Setup ZK Environment

This will install circom compiler and download Powers of Tau:

```bash
yarn zk:setup
```

**What this does:**
- Installs circom compiler
- Creates directory structure
- Downloads Powers of Tau (trusted setup parameters)

### Step 3: Compile Circuits

Compile circom circuits and generate proving/verification keys:

```bash
yarn zk:compile
```

**This may take 5-10 minutes** depending on your system.

**What this does:**
- Compiles `.circom` files to R1CS
- Generates witness calculators (WASM)
- Creates proving keys (.zkey files)
- Creates verification keys (JSON)
- Generates Solidity verifiers

### Step 4: Deploy Contracts

```bash
yarn deploy:local  # For local network
# or
yarn deploy:fuji   # For Avalanche Fuji testnet
```

---

## Usage Guide

### For Users

#### 1. Verify Input Before Model Execution

```typescript
import { generateInputProof, formatProofForSolidity } from "./scripts/zkUtils";

// Your input data (kept private)
const inputData = [10, 20, 30, 40, 50];
const minValue = 0;
const maxValue = 100;

// Generate proof
const { proof, publicSignals } = await generateInputProof(
  inputData,
  minValue,
  maxValue
);

// Format for smart contract
const solidityProof = formatProofForSolidity(proof, publicSignals);

// Submit to contract
const tx = await modelRegistryZK.verifyInput(solidityProof);
const receipt = await tx.wait();

// Extract input hash from events
const inputHash = receipt.events[0].args.inputHash;

// Execute model with verified input
await modelRegistryZK.executeModelWithZK(modelId, inputHash);
```

#### 2. Verify Model Output

```typescript
import { generateOutputProof } from "./scripts/zkUtils";

// Model output (private)
const outputData = [100, 200, 150, 180, 220];
const modelId = 1;
const modelSecret = BigInt("your-model-secret");

// Generate proof
const { proof, publicSignals } = await generateOutputProof(
  outputData,
  0,      // minValue
  1000,   // maxValue
  modelId,
  modelSecret
);

// Verify on-chain
const tx = await modelRegistryZK.verifyOutput(
  modelId,
  formatProofForSolidity(proof, publicSignals)
);
```

### For Model Owners

#### 1. Register Model with Secret

```typescript
// Register model
await modelRegistryZK.registerModel("docker.io/mymodel:v1");

// Set model secret (keep this secret!)
const modelSecret = BigInt("your-random-secret");
const secretHash = ethers.keccak256(ethers.toUtf8Bytes(modelSecret.toString()));

await modelRegistryZK.setModelSecret(modelId, secretHash);
```

#### 2. Generate Output Proofs

When your model produces output, generate a proof:

```typescript
const outputProof = await generateOutputProof(
  modelOutput,
  minValue,
  maxValue,
  modelId,
  modelSecret  // Your secret
);

// Submit proof
await modelRegistryZK.verifyOutput(modelId, outputProof);
```

---

## Circuit Specifications

### Input Verifier Circuit

**Public Inputs:**
- `inputHash`: Poseidon hash of input data
- `minValue`: Minimum allowed value
- `maxValue`: Maximum allowed value

**Private Inputs (Witness):**
- `inputData[10]`: Actual input values
- `inputLength`: Number of actual inputs

**Constraints:**
- Hash verification: `Poseidon(inputData) == inputHash`
- Range check: `minValue <= inputData[i] <= maxValue` for all i
- Length validation: `inputLength <= 10`

### Output Verifier Circuit

**Public Inputs:**
- `outputHash`: Poseidon hash of output
- `minValue`: Minimum output value
- `maxValue`: Maximum output value
- `modelId`: ID of model that generated output

**Private Inputs (Witness):**
- `outputData[10]`: Actual output values
- `modelSecret`: Secret known only to model owner

**Constraints:**
- Hash verification: `Poseidon(outputData || modelSecret || modelId) == outputHash`
- Range check: `minValue <= outputData[i] <= maxValue`
- Sum validation: For probability outputs, sum ≈ 1.0 (with tolerance)

---

## Smart Contracts

### ModelRegistryZK

#### Key Functions

##### `verifyInput(ZKProof calldata proof)`
Verifies input data using ZK proof.

**Parameters:**
```solidity
struct ZKProof {
    uint256[2] a;
    uint256[2][2] b;
    uint256[2] c;
    uint256[] publicSignals;
}
```

**Returns:** `bytes32 inputHash` - Hash of verified input

##### `verifyOutput(uint256 modelId, ZKProof calldata proof)`
Verifies model output using ZK proof.

**Returns:** `bytes32 outputHash` - Hash of verified output

##### `executeModelWithZK(uint256 modelId, bytes32 inputHash)`
Executes model with previously verified input.

**Returns:** `bool success`

##### `verifyInputBatch(ZKProof[] calldata proofs)`
Batch verify multiple inputs (gas efficient).

**Returns:** `bytes32[] memory inputHashes`

#### Admin Functions

##### `setInputVerifier(address _verifier)`
Set the input verifier contract address.

##### `setOutputVerifier(address _verifier)`
Set the output verifier contract address.

##### `toggleZKVerification(bool _enabled)`
Enable/disable ZK verification (useful for testing).

---

## Testing

### Local Testing

#### 1. Test Circuit Proof Generation

```bash
yarn zk:test
```

This will:
- Generate proofs for sample inputs/outputs
- Verify proofs locally
- Test invalid inputs
- Save proofs to `zkproof/` directory

#### 2. Test Smart Contracts

```bash
yarn test
```

Runs the full test suite including:
- Contract deployment
- Verifier integration
- Proof verification on-chain
- Edge cases and error handling

### Manual Testing

```typescript
// In Hardhat console
const ModelRegistryZK = await ethers.getContractFactory("ModelRegistryZK");
const registry = await ModelRegistryZK.deploy();

// Disable ZK for testing
await registry.toggleZKVerification(false);

// Test input verification
const mockProof = {
  a: [1, 2],
  b: [[3, 4], [5, 6]],
  c: [7, 8],
  publicSignals: [ethers.toBigInt("0x123..."), 10, 100]
};

await registry.verifyInput(mockProof);
```

---

## Security Considerations

### Circuit Security

1. **Trusted Setup**: Uses Powers of Tau ceremony for secure parameters
2. **Hash Function**: Poseidon is ZK-friendly and collision-resistant
3. **Range Checks**: Prevents overflow/underflow attacks
4. **Constraint System**: All constraints are properly constrained

### Smart Contract Security

1. **Access Control**: Only model owners can set secrets
2. **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
3. **Input Validation**: All inputs are validated before processing
4. **Gas Limits**: Batch operations have reasonable limits

### Best Practices

1. **Keep Model Secrets Private**: Never expose `modelSecret` on-chain
2. **Rotate Secrets**: Periodically update model secrets
3. **Monitor Verifier Contracts**: Ensure verifiers are not compromised
4. **Rate Limiting**: Implement rate limits for proof submissions
5. **Audit Circuits**: Have circuits audited before production use

---

## Troubleshooting

### Common Issues

#### 1. "Circom not found"

**Solution:**
```bash
yarn zk:setup
```

If still failing, manually install circom:
```bash
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
```

#### 2. "Powers of Tau download failed"

**Solution:**
Manually download from: https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau

Place in: `zkproof/keys/powersOfTau28_hez_final_14.ptau`

#### 3. "Out of memory during compilation"

**Solution:**
- Close other applications
- Increase system swap space
- Use a machine with more RAM (8GB minimum)
- Reduce circuit size in `.circom` files

#### 4. "Proof generation fails"

**Solution:**
- Check input format matches circuit expectations
- Ensure all values are within specified ranges
- Verify WASM and zkey files exist
- Run `yarn zk:compile` again

#### 5. "Verifier contract not found"

**Solution:**
```bash
yarn zk:compile
# This regenerates verifier contracts
```

#### 6. "Gas estimation failed"

**Solution:**
- Disable ZK verification for testing: `toggleZKVerification(false)`
- Check public signals format
- Ensure verifier contracts are deployed

---

## Performance Metrics

### Circuit Compilation Time
- Input Verifier: ~2-3 minutes
- Output Verifier: ~2-3 minutes
- Total: ~5-10 minutes

### Proof Generation Time
- Input Proof: ~1-2 seconds
- Output Proof: ~1-2 seconds

### Gas Costs (Approximate)

| Operation | Gas Cost |
|-----------|----------|
| Verify Input Proof | ~250,000 |
| Verify Output Proof | ~300,000 |
| Execute Model with ZK | ~150,000 |
| Batch Verify (3 proofs) | ~600,000 |

---

## Advanced Configuration

### Customizing Circuit Size

Edit the circuit files to change parameters:

```circom
// In input_verifier.circom
component main {public [inputHash, minValue, maxValue]} = InputVerifier(20); // Increase from 10 to 20
```

Then recompile:
```bash
yarn zk:compile
```

### Using Different Hash Functions

While Poseidon is recommended for ZK circuits, you can modify to use other hash functions. Update the circuit:

```circom
include "../node_modules/circomlib/circuits/mimc.circom";
component hasher = MiMC7(maxInputSize);
```

---

## Integration with Frontend

### Example React Component

```typescript
import { generateInputProof, formatProofForSolidity } from '@/utils/zkUtils';
import { useScaffoldWriteContract } from '@/hooks/scaffold-eth';

function VerifyInput() {
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "ModelRegistryZK"
  });

  const handleVerify = async (inputData: number[]) => {
    const { proof, publicSignals } = await generateInputProof(
      inputData, 0, 100
    );
    
    const solidityProof = formatProofForSolidity(proof, publicSignals);
    
    await writeContractAsync({
      functionName: "verifyInput",
      args: [solidityProof]
    });
  };

  return <button onClick={() => handleVerify([1,2,3])}>Verify</button>;
}
```

---

## Resources

### Documentation
- [Circom Documentation](https://docs.circom.io/)
- [SnarkJS Documentation](https://github.com/iden3/snarkjs)
- [ZK Learning Resources](https://zkp.science/)

### Community
- [Circom Discord](https://discord.gg/zkpKTC)
- [Ethereum ZK Forum](https://ethresear.ch/)

---

## License

BSD-3-Clause (same as parent project)

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Open an issue on GitHub
3. Contact the development team

---

## Changelog

### v1.0.0 (2025-11-08)
- ✅ Initial ZK implementation
- ✅ Input and output verification circuits
- ✅ Solidity verifier integration
- ✅ Utility scripts and testing suite
- ✅ Comprehensive documentation

---

## Future Enhancements

- [ ] Add recursive proof composition
- [ ] Implement zkSNARK rollups for batching
- [ ] Add support for larger input sizes
- [ ] Integrate Chainlink VRF for randomness
- [ ] Add frontend UI for proof generation
- [ ] Implement proof caching mechanism
- [ ] Add multi-model proof aggregation


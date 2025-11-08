# ZK Proof Quick Start Guide

Get up and running with Zero-Knowledge proofs in ChainAI in 5 minutes!

## 🚀 Quick Setup (3 steps)

### 1. Install Dependencies

```bash
cd packages/hardhat
yarn install
```

### 2. Setup ZK Environment

```bash
yarn zk:setup
```

This will:
- ✅ Install Circom compiler
- ✅ Create necessary directories
- ✅ Download Powers of Tau (~200MB)

**⏱️ Time: ~2-3 minutes**

### 3. Compile Circuits

```bash
yarn zk:compile
```

This will:
- ✅ Compile Circom circuits
- ✅ Generate proving keys
- ✅ Generate verification keys
- ✅ Create Solidity verifiers

**⏱️ Time: ~5-10 minutes**

---

## ✅ Test Your Setup

Run the test script to verify everything works:

```bash
yarn zk:test
```

You should see:
```
========================================
Testing ZK Proof System
========================================

Test 1: Input Verification
---------------------------
✓ Input proof generated successfully
✓ Input proof verification: VALID
✅ Test 1 PASSED

Test 2: Output Verification
----------------------------
✓ Output proof generated successfully
✓ Output proof verification: VALID
✅ Test 2 PASSED

All Tests Completed Successfully! 🎉
```

---

## 📝 Basic Usage

### Example 1: Verify User Input

```typescript
import { generateInputProof, formatProofForSolidity } from './scripts/zkUtils';
import { ethers } from 'hardhat';

// User's private input data
const userInput = [25, 50, 75, 30, 60];

// Generate ZK proof
const { proof, publicSignals } = await generateInputProof(
  userInput,  // Private data (never revealed)
  0,          // Min value
  100         // Max value
);

// What's public: Only the hash and constraints
// What's private: The actual values [25, 50, 75, 30, 60]

// Submit to blockchain
const modelRegistryZK = await ethers.getContractAt("ModelRegistryZK", contractAddress);
const tx = await modelRegistryZK.verifyInput(
  formatProofForSolidity(proof, publicSignals)
);

console.log("Input verified without revealing values! ✓");
```

### Example 2: Verify Model Output

```typescript
import { generateOutputProof } from './scripts/zkUtils';

// Model's private output
const modelOutput = [120, 230, 145, 189, 210];
const modelId = 1;
const modelSecret = BigInt("your-secret-key");

// Generate proof
const { proof, publicSignals } = await generateOutputProof(
  modelOutput,
  0,
  1000,
  modelId,
  modelSecret
);

// Submit to blockchain
const tx = await modelRegistryZK.verifyOutput(
  modelId,
  formatProofForSolidity(proof, publicSignals)
);

console.log("Output verified! Model authenticated! ✓");
```

---

## 🎯 Use Cases

### 1. **Private AI Inference**
Users can prove their inputs are valid without revealing them to the blockchain or model operators.

**Example**: Medical diagnosis
- Input: Patient symptoms (private)
- Proof: "All inputs are valid medical codes"
- Nobody sees actual symptoms!

### 2. **Model Authentication**
Prove outputs came from a specific model without revealing the model's internal workings.

**Example**: Credit scoring
- Output: Credit scores (private)
- Proof: "These scores were computed by certified model #42"
- Model logic stays secret!

### 3. **Data Privacy**
Keep sensitive data off-chain while maintaining verifiability.

**Example**: Salary verification
- Input: Salary amount (private)
- Proof: "Salary is between $50k-$150k"
- Exact amount never revealed!

---

## 🧪 Testing Workflow

### 1. Local Testing (No Blockchain)

```bash
# Test proof generation
yarn zk:test
```

### 2. Contract Testing (Local Blockchain)

```bash
# Terminal 1: Start local chain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy:local

# Terminal 3: Run contract tests
yarn test
```

### 3. Integration Testing (Testnet)

```bash
# Deploy to Fuji testnet
yarn deploy:fuji

# Test on testnet
yarn hardhat test --network avalancheFuji
```

---

## 📂 Project Structure

```
packages/hardhat/
├── circuits/               # Circom circuits
│   ├── input_verifier.circom
│   ├── output_verifier.circom
│   └── README.md
├── contracts/
│   ├── ModelRegistryZK.sol
│   └── verifiers/         # Auto-generated
│       ├── input_verifier_verifier.sol
│       └── output_verifier_verifier.sol
├── scripts/
│   ├── setup-circuits.sh
│   ├── compile-circuits.sh
│   ├── zkUtils.ts         # Utility functions
│   └── test-zk-proof.ts   # Test script
├── zkproof/
│   ├── keys/              # Proving/verification keys
│   ├── input/             # Input proofs
│   └── output/            # Output proofs
└── test/
    └── ModelRegistryZK.test.ts
```

---

## 🔍 How It Works

### The Magic of ZK Proofs

```
┌─────────────────────────────────────────────────┐
│  Private Data (Never Revealed)                  │
│  • User Input: [25, 50, 75, 30, 60]            │
│  • Model Secret: 0xabc123...                    │
└─────────────┬───────────────────────────────────┘
              │
              ↓
      ┌───────────────┐
      │ Generate Proof│
      └───────┬───────┘
              │
              ↓
┌─────────────────────────────────────────────────┐
│  Public Data (On Blockchain)                    │
│  • Hash: 0x789def...                            │
│  • Constraints: min=0, max=100                  │
│  • Proof: cryptographic proof                   │
└─────────────┬───────────────────────────────────┘
              │
              ↓
      ┌───────────────┐
      │Verify On-Chain│  ← Gas: ~250k
      └───────┬───────┘
              │
              ↓
        ✅ Valid! 
   (without seeing private data)
```

### What Gets Verified?

✅ **Input Verification**
- ✓ Hash matches (data integrity)
- ✓ All values in range [min, max]
- ✓ Format is valid

❌ **Not Revealed**
- ✗ Actual input values
- ✗ Number of inputs
- ✗ Computation details

✅ **Output Verification**
- ✓ Output from correct model
- ✓ Model owner authenticated
- ✓ Values in valid range

❌ **Not Revealed**
- ✗ Actual output values
- ✗ Model secret
- ✗ Model computations

---

## 🛠️ Common Commands

```bash
# Setup
yarn zk:setup              # Install circom & setup
yarn zk:compile            # Compile circuits
yarn zk:generate-verifiers # Generate Solidity verifiers

# Testing
yarn zk:test              # Test proof generation
yarn test                 # Test smart contracts

# Deployment
yarn deploy:local         # Deploy to local network
yarn deploy:fuji          # Deploy to Avalanche Fuji
yarn deploy:mainnet       # Deploy to Avalanche mainnet

# Development
yarn chain                # Start local blockchain
yarn compile              # Compile Solidity contracts
yarn hardhat console      # Interactive console
```

---

## 🐛 Troubleshooting

### Problem: "Circom not found"

```bash
# Solution 1: Run setup again
yarn zk:setup

# Solution 2: Install manually
git clone https://github.com/iden3/circom.git
cd circom
cargo build --release
cargo install --path circom
```

### Problem: "Out of memory"

```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=8192"
yarn zk:compile
```

### Problem: "Proof generation fails"

```typescript
// Check your input format
const input = [1, 2, 3];  // Must be numbers
const minValue = 0;       // Must be >= 0
const maxValue = 100;     // Must be >= minValue

// Ensure values are in range
input.every(v => v >= minValue && v <= maxValue); // Must be true
```

### Problem: "Contract verification fails"

```bash
# 1. Ensure verifiers are deployed
yarn zk:compile
yarn deploy:local

# 2. Check if ZK verification is enabled
# In your contract, call:
await modelRegistryZK.zkVerificationEnabled() // Should be true

# 3. Disable for testing
await modelRegistryZK.toggleZKVerification(false)
```

---

## 📚 Next Steps

1. **Read Full Documentation**
   - [ZK Implementation Guide](./ZK_IMPLEMENTATION.md)
   - [Circuit Specifications](./circuits/README.md)

2. **Integrate with Frontend**
   - Use zkUtils in your React/Next.js app
   - Add proof generation to your UI

3. **Customize Circuits**
   - Modify `circuits/*.circom` for your needs
   - Adjust input/output sizes
   - Add custom constraints

4. **Deploy to Production**
   - Audit circuits and contracts
   - Deploy to Avalanche mainnet
   - Monitor gas costs and optimize

---

## 💡 Pro Tips

1. **Batch Verification**: Verify multiple proofs together to save gas

```typescript
const proofs = [proof1, proof2, proof3];
await modelRegistryZK.verifyInputBatch(proofs);
// Saves ~30% gas vs individual verifications
```

2. **Cache Proofs**: Store generated proofs to avoid regenerating

```typescript
import { saveProof, loadProof } from './scripts/zkUtils';

// Save
saveProof('input_verifier', proof, publicSignals, 'my-proof.json');

// Load later
const { proof, publicSignals } = loadProof('zkproof/input/my-proof.json');
```

3. **Disable ZK for Testing**: Speed up development

```typescript
await modelRegistryZK.toggleZKVerification(false);
// Now you can test without real proofs
```

4. **Monitor Gas Costs**: Track verification costs

```typescript
const tx = await modelRegistryZK.verifyInput(proof);
const receipt = await tx.wait();
console.log('Gas used:', receipt.gasUsed.toString());
```

---

## 🎓 Learn More

- **Zero-Knowledge Proofs**: https://zkp.science/
- **Circom Language**: https://docs.circom.io/
- **SnarkJS Library**: https://github.com/iden3/snarkjs
- **ZK Security**: https://0xparc.org/

---

## 🆘 Get Help

- 📖 Read the [Full Documentation](./ZK_IMPLEMENTATION.md)
- 🐛 Check [Troubleshooting](#troubleshooting)
- 💬 Ask in Discord/Telegram
- 🔍 Search existing issues

---

**Ready to build privacy-preserving AI on Avalanche! 🚀**


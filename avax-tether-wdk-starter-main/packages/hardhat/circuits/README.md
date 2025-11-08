# ZK Circuits for ChainAI

This directory contains the Circom circuits for zero-knowledge proof generation and verification.

## Circuits

### 1. input_verifier.circom

**Purpose**: Verify that user inputs meet specified constraints without revealing the actual input values.

**Use Case**: A user wants to prove their input data is within valid ranges (e.g., 0-100) without revealing the actual values on-chain.

**Features**:
- Hash-based integrity verification using Poseidon
- Range checking for each input value
- Input length validation
- Support for up to 10 input values

**Public Inputs** (visible on-chain):
- `inputHash`: Hash of the input data
- `minValue`: Minimum allowed value (e.g., 0)
- `maxValue`: Maximum allowed value (e.g., 100)

**Private Inputs** (kept secret):
- `inputData[10]`: The actual input values
- `inputLength`: Number of actual inputs used

**Example**:
```
User has input: [25, 50, 75, 30, 60]
Range: [0, 100]

Public on-chain:
  - inputHash: 0x123abc...
  - minValue: 0
  - maxValue: 100

Private (never revealed):
  - inputData: [25, 50, 75, 30, 60, 0, 0, 0, 0, 0]
  - inputLength: 5

Proof confirms: "All 5 values are between 0-100" ✓
Without revealing: What those values actually are!
```

### 2. output_verifier.circom

**Purpose**: Verify that AI model outputs are valid and came from a specific model, without revealing the computation details.

**Use Case**: An AI model produces predictions and wants to prove the outputs are within expected ranges and came from the legitimate model, without revealing the model's internal workings.

**Features**:
- Output range validation
- Model authentication (binds output to specific model ID)
- Model secret integration (prevents forgery)
- Probability distribution validation (for classification outputs)

**Public Inputs** (visible on-chain):
- `outputHash`: Hash of the output data
- `minValue`: Minimum allowed output value
- `maxValue`: Maximum allowed output value
- `modelId`: ID of the model that generated the output

**Private Inputs** (kept secret):
- `outputData[10]`: The actual output values
- `modelSecret`: Secret key known only to the model owner

**Example**:
```
Model produces output: [120, 230, 145, 189, 210]
Range: [0, 1000]
Model ID: 42
Model Secret: 0xsecret123...

Public on-chain:
  - outputHash: 0x456def...
  - minValue: 0
  - maxValue: 1000
  - modelId: 42

Private (never revealed):
  - outputData: [120, 230, 145, 189, 210, 0, 0, 0, 0, 0]
  - modelSecret: 0xsecret123...

Proof confirms: 
  1. "All outputs are between 0-1000" ✓
  2. "Output came from model #42" ✓
  3. "Model owner signed this output" ✓
Without revealing: The actual values or the model secret!
```

## How It Works

### Circuit Flow

```
┌──────────────┐
│ Private Data │
│ (Input/Output)│
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Generate   │
│   Witness    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Circuit    │
│ Constraints  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Generate   │
│    Proof     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Verify     │
│  On-Chain    │
└──────────────┘
```

### Key Concepts

1. **Witness**: The private data (input/output values) that you want to keep secret

2. **Constraints**: Mathematical rules that the witness must satisfy
   - Example: `value >= minValue AND value <= maxValue`

3. **Proof**: Cryptographic evidence that constraints are satisfied, without revealing the witness

4. **Verification**: On-chain validation that the proof is correct

## Compilation

The circuits are compiled using Circom and SnarkJS:

```bash
# Compile to R1CS (Rank-1 Constraint System)
circom input_verifier.circom --r1cs --wasm --sym

# Generate proving key
snarkjs groth16 setup input_verifier.r1cs powersOfTau.ptau input_verifier.zkey

# Generate verification key
snarkjs zkey export verificationkey input_verifier.zkey verification_key.json

# Generate Solidity verifier
snarkjs zkey export solidityverifier input_verifier.zkey verifier.sol
```

Or simply run:
```bash
yarn zk:compile
```

## Circuit Parameters

### Adjustable Parameters

You can modify these parameters based on your needs:

1. **Max Input/Output Size**: Change the array size
   ```circom
   component main = InputVerifier(20); // Instead of 10
   ```

2. **Range Constraints**: Modify min/max values
   - Set at proof generation time
   - Can be different for each proof

3. **Hash Function**: Currently uses Poseidon (ZK-friendly)
   - Can be changed to MiMC or other ZK-friendly hashes
   - Poseidon is recommended for performance

## Security Considerations

### What's Private?

✅ **Private** (never revealed):
- Actual input/output values
- Model secrets
- Internal computations

❌ **Public** (visible on-chain):
- Hash of data (doesn't reveal original data)
- Min/max constraints
- Model ID
- Proof itself (doesn't reveal witness)

### Security Properties

1. **Zero-Knowledge**: Verifier learns nothing about private data except that constraints are satisfied

2. **Soundness**: Impossible to generate valid proof for invalid data (computationally infeasible)

3. **Completeness**: Valid data always produces valid proof

### Attack Resistance

- **Brute Force**: Infeasible due to large field size (≈2^254)
- **Proof Forgery**: Requires breaking SNARK security (assumed hard)
- **Hash Collision**: Poseidon is collision-resistant
- **Side Channel**: Constant-time operations in circuits

## Performance

### Circuit Complexity

| Circuit | Constraints | Proof Time | Verification Time |
|---------|-------------|------------|-------------------|
| Input Verifier (10) | ~15,000 | ~1-2s | ~2-3ms (on-chain) |
| Output Verifier (10) | ~18,000 | ~1-2s | ~2-3ms (on-chain) |

### Gas Costs

| Operation | Gas Cost |
|-----------|----------|
| Verify Input Proof | ~250k |
| Verify Output Proof | ~300k |

### Optimization Tips

1. **Batch Verification**: Verify multiple proofs together
2. **Proof Aggregation**: Combine proofs for gas savings
3. **Circuit Size**: Smaller circuits = faster proofs
4. **Field Operations**: Minimize divisions and exponentiations

## Testing

### Local Testing

```bash
# Test proof generation and verification
yarn zk:test
```

### Manual Testing

```typescript
import { generateInputProof, verifyInputProof } from '../scripts/zkUtils';

// Test valid input
const { proof, publicSignals } = await generateInputProof(
  [10, 20, 30],  // input data
  0,              // min value
  100             // max value
);

const valid = await verifyInputProof(proof, publicSignals);
console.log('Proof valid:', valid); // Should be true

// Test invalid input (out of range)
try {
  await generateInputProof([150, 200], 0, 100);
} catch (error) {
  console.log('Invalid input rejected'); // Expected
}
```

## Dependencies

The circuits use circomlib for common components:

- `poseidon.circom`: Poseidon hash function
- `comparators.circom`: LessThan, GreaterThan, etc.
- `bitify.circom`: Num2Bits, Bits2Num

Install with:
```bash
npm install circomlib
```

## Troubleshooting

### Common Issues

**"Cannot find circomlib"**
```bash
npm install circomlib
# Or add node_modules path:
circom circuit.circom -l ./node_modules
```

**"Not enough constraints"**
- Ensure all signals are properly constrained
- Use `<==` instead of `<--` for assignments that need constraints

**"Compilation takes too long"**
- Reduce circuit size
- Use more efficient operations
- Increase system RAM

**"Proof generation fails"**
- Check input format
- Verify value ranges
- Ensure witness satisfies all constraints

## Resources

- [Circom Documentation](https://docs.circom.io/)
- [Circomlib Library](https://github.com/iden3/circomlib)
- [ZK Proofs Tutorial](https://zkp.science/)
- [SnarkJS Guide](https://github.com/iden3/snarkjs)

## Examples

See `../scripts/test-zk-proof.ts` for complete examples of:
- Generating proofs
- Verifying proofs locally
- Submitting proofs on-chain
- Handling errors


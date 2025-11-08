# ZK System Architecture - ChainAI

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER / MODEL OWNER                              │
│                         (Off-chain / Frontend)                           │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
                             │ Private Data
                             ↓
         ┌───────────────────────────────────────────┐
         │      ZK Proof Generation (Off-chain)      │
         │                                            │
         │  ┌──────────────────────────────────────┐ │
         │  │   1. Input Data Processing           │ │
         │  │      • Hash with Poseidon            │ │
         │  │      • Validate ranges               │ │
         │  │      • Format check                  │ │
         │  └──────────────────────────────────────┘ │
         │                    ↓                       │
         │  ┌──────────────────────────────────────┐ │
         │  │   2. Witness Generation              │ │
         │  │      • Private inputs (witness)      │ │
         │  │      • Public inputs (hash, ranges)  │ │
         │  │      • Circuit constraints           │ │
         │  └──────────────────────────────────────┘ │
         │                    ↓                       │
         │  ┌──────────────────────────────────────┐ │
         │  │   3. Proof Generation (Groth16)      │ │
         │  │      • π (proof)                     │ │
         │  │      • Public signals                │ │
         │  └──────────────────────────────────────┘ │
         └───────────────────┬───────────────────────┘
                             │
                             │ Proof + Public Signals
                             ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                      AVALANCHE BLOCKCHAIN                                │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      ModelRegistryZK Contract                       │ │
│  │                                                                      │ │
│  │  ┌────────────────┐         ┌─────────────────┐                   │ │
│  │  │  verifyInput() │         │ verifyOutput()  │                   │ │
│  │  │                │         │                 │                   │ │
│  │  │  • Receives    │         │  • Receives     │                   │ │
│  │  │    proof       │         │    proof        │                   │ │
│  │  │  • Calls       │         │  • Calls        │                   │ │
│  │  │    verifier    │         │    verifier     │                   │ │
│  │  └────────┬───────┘         └────────┬────────┘                   │ │
│  │           │                          │                             │ │
│  │           ↓                          ↓                             │ │
│  │  ┌────────────────┐         ┌─────────────────┐                   │ │
│  │  │ Input Verifier │         │ Output Verifier │                   │ │
│  │  │   Contract     │         │    Contract     │                   │ │
│  │  │                │         │                 │                   │ │
│  │  │ • Groth16      │         │ • Groth16       │                   │ │
│  │  │   verification │         │   verification  │                   │ │
│  │  │ • Returns      │         │ • Returns       │                   │ │
│  │  │   true/false   │         │   true/false    │                   │ │
│  │  └────────┬───────┘         └────────┬────────┘                   │ │
│  │           │                          │                             │ │
│  │           └──────────┬───────────────┘                             │ │
│  │                      ↓                                              │ │
│  │           ┌────────────────────┐                                   │ │
│  │           │   Verification     │                                   │ │
│  │           │      Result        │                                   │ │
│  │           │    ✓ or ✗          │                                   │ │
│  │           └────────────────────┘                                   │ │
│  │                      │                                              │ │
│  │                      ↓                                              │ │
│  │           ┌────────────────────┐                                   │ │
│  │           │  executeModelWithZK│                                   │ │
│  │           │                    │                                   │ │
│  │           │  • Checks input    │                                   │ │
│  │           │    verified        │                                   │ │
│  │           │  • Executes model  │                                   │ │
│  │           │  • Logs event      │                                   │ │
│  │           └────────────────────┘                                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Off-Chain Components

#### A. ZK Circuit Files (Circom)
```
circuits/
├── input_verifier.circom
│   ├── Inputs: inputHash, minValue, maxValue
│   ├── Witness: inputData[], inputLength
│   └── Constraints: hash verification, range checks
│
└── output_verifier.circom
    ├── Inputs: outputHash, minValue, maxValue, modelId
    ├── Witness: outputData[], modelSecret
    └── Constraints: hash verification, range checks, model binding
```

#### B. Proof Generation (zkUtils.ts)
```typescript
generateInputProof()
├── 1. Hash input data with Poseidon
├── 2. Create witness (private + public inputs)
├── 3. Load WASM witness calculator
├── 4. Load proving key (.zkey)
├── 5. Generate Groth16 proof
└── 6. Return (proof, publicSignals)

generateOutputProof()
├── 1. Hash output + modelSecret + modelId
├── 2. Create witness
├── 3. Load WASM calculator
├── 4. Load proving key
├── 5. Generate proof
└── 6. Return (proof, publicSignals)
```

### 2. On-Chain Components

#### A. ModelRegistryZK Contract
```solidity
contract ModelRegistryZK {
    // State
    IZKVerifier inputVerifier;
    IZKVerifier outputVerifier;
    mapping(bytes32 => bool) verifiedInputs;
    mapping(bytes32 => bool) verifiedOutputs;
    
    // Main Functions
    function verifyInput(ZKProof proof) → bytes32 inputHash
    function verifyOutput(uint256 modelId, ZKProof proof) → bytes32 outputHash
    function executeModelWithZK(uint256 modelId, bytes32 inputHash) → bool
    function verifyInputBatch(ZKProof[] proofs) → bytes32[] inputHashes
}
```

#### B. Verifier Contracts (Auto-generated)
```solidity
contract Input_verifier_verifier {
    function verifyProof(
        uint256[2] _pA,
        uint256[2][2] _pB,
        uint256[2] _pC,
        uint256[] _pubSignals
    ) returns (bool)
}
```

## Data Flow

### Input Verification Flow

```
┌──────────────┐
│ User Input   │  [25, 50, 75] (private)
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│ Hash with Poseidon   │  hash = Poseidon([25,50,75])
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Generate Witness     │  {inputData: [25,50,75], 
└──────┬───────────────┘   inputHash: hash, min: 0, max: 100}
       │
       ↓
┌──────────────────────┐
│ Circuit Constraints  │  ✓ hash matches
└──────┬───────────────┘  ✓ 25,50,75 in [0,100]
       │
       ↓
┌──────────────────────┐
│ Generate Groth16     │  π = (A, B, C)
│      Proof           │  publicSignals = [hash, 0, 100]
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Submit to Blockchain │  verifyInput(π, publicSignals)
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Verifier Contract    │  verify(π) → true
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ ModelRegistryZK      │  verifiedInputs[hash] = true
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Execute Model        │  executeModelWithZK(modelId, hash)
└──────────────────────┘
```

### Output Verification Flow

```
┌──────────────┐
│ Model Output │  [120, 230, 145] (private)
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│ Hash with Secret     │  hash = Poseidon([120,230,145,secret,modelId])
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Generate Witness     │  {outputData: [120,230,145],
└──────┬───────────────┘   modelSecret, modelId, hash, range}
       │
       ↓
┌──────────────────────┐
│ Circuit Constraints  │  ✓ hash matches
└──────┬───────────────┘  ✓ values in range
       │                  ✓ model authenticated
       ↓
┌──────────────────────┐
│ Generate Proof       │  π = (A, B, C)
└──────┬───────────────┘  publicSignals = [hash, min, max, modelId]
       │
       ↓
┌──────────────────────┐
│ Submit to Blockchain │  verifyOutput(modelId, π)
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Verifier Contract    │  verify(π) → true
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ ModelRegistryZK      │  verifiedOutputs[hash] = true
└──────────────────────┘
```

## Security Architecture

### Layers of Security

```
┌─────────────────────────────────────────────┐
│          Layer 4: Access Control            │
│  • Ownable (OpenZeppelin)                   │
│  • Model owner verification                 │
│  • Admin controls                           │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│     Layer 3: Smart Contract Security        │
│  • ReentrancyGuard                          │
│  • Input validation                         │
│  • Custom errors (gas efficient)            │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│       Layer 2: ZK Proof Verification        │
│  • Groth16 SNARK verification              │
│  • Public signals validation                │
│  • Verifier contract calls                  │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│    Layer 1: Cryptographic Guarantees        │
│  • Zero-knowledge property                  │
│  • Soundness (~2^128 security)              │
│  • Collision-resistant hashing (Poseidon)   │
└─────────────────────────────────────────────┘
```

## Gas Optimization Strategy

```
┌────────────────────────────────────────┐
│   Single Proof Verification            │
│   Gas: ~250k (input) / ~300k (output)  │
└────────────────────────────────────────┘

              vs

┌────────────────────────────────────────┐
│   Batch Verification (3 proofs)        │
│   Gas: ~600k total                     │
│   Savings: ~30%                        │
│                                         │
│   Implementation:                      │
│   verifyInputBatch(proof[])            │
└────────────────────────────────────────┘
```

## Privacy Guarantees

### What's Public (On-Chain)

```
✓ Hash of data (doesn't reveal original)
✓ Range constraints (min/max)
✓ Model ID
✓ Proof structure (A, B, C)
✓ Public signals
```

### What's Private (Never Revealed)

```
✗ Actual input values
✗ Actual output values
✗ Model secret key
✗ Computation details
✗ Number of actual inputs
```

## Integration Points

### Frontend Integration

```typescript
// React/Next.js Component
import { generateInputProof } from '@/utils/zkUtils';
import { useScaffoldWriteContract } from '@/hooks/scaffold-eth';

function VerifyButton() {
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "ModelRegistryZK"
  });
  
  const verify = async () => {
    // Off-chain: Generate proof
    const { proof } = await generateInputProof(inputData, 0, 100);
    
    // On-chain: Verify
    await writeContractAsync({
      functionName: "verifyInput",
      args: [formatProofForSolidity(proof)]
    });
  };
}
```

### Backend Integration

```typescript
// Node.js Backend
import { generateOutputProof } from './zkUtils';

async function processModelOutput(modelId, output, secret) {
  // Generate proof
  const { proof, publicSignals } = await generateOutputProof(
    output, 0, 1000, modelId, secret
  );
  
  // Submit to blockchain
  const tx = await modelRegistryZK.verifyOutput(
    modelId,
    formatProofForSolidity(proof, publicSignals)
  );
  
  return await tx.wait();
}
```

## Deployment Architecture

### Local Development

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Hardhat   │────→│  Localhost  │────→│   Frontend  │
│   Node      │     │  :8545      │     │   :3000     │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Testnet Deployment

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Deploy    │────→│  Avalanche  │────→│   Verify    │
│   Script    │     │   Fuji      │     │   Explorer  │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Production

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CI/CD     │────→│  Avalanche  │────→│  Frontend   │
│   Pipeline  │     │   Mainnet   │     │   + Backend │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Monitoring & Observability

### Events to Monitor

```solidity
event InputVerified(bytes32 indexed inputHash, address indexed user, uint256 timestamp);
event OutputVerified(bytes32 indexed outputHash, uint256 indexed modelId, uint256 timestamp);
event ModelSelected(uint256 indexed modelId, address indexed owner, bool wasTopModel, uint256 timestamp);
event ZKVerificationToggled(bool enabled, uint256 timestamp);
event VerifierUpdated(address indexed verifier, bool isInputVerifier, uint256 timestamp);
```

### Metrics to Track

```
- Proofs generated per day
- Verification success rate
- Average gas cost per verification
- Proof generation latency
- Circuit constraint violations
- Model authentication failures
```

## Scalability Considerations

### Current Limits

```
Input Verifier:  10 inputs max
Output Verifier: 10 outputs max
Constraints:     ~15k-18k per circuit
Proof Time:      1-2 seconds
Verification:    250-300k gas
```

### Scaling Strategies

```
1. Increase circuit size (trade-off: longer compilation)
2. Implement proof aggregation
3. Use recursive SNARKs
4. Batch verification (already implemented)
5. Layer 2 solutions for cheaper verification
```

---

**This architecture provides privacy-preserving AI verification on Avalanche with strong cryptographic guarantees! 🔐**


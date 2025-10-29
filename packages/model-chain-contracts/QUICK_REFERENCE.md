# ModelChain Smart Contracts - Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd packages/model-chain-contracts && npm install

# 2. Compile contracts
npm run build

# 3. Run tests
npm test

# 4. Deploy to Fuji testnet
npm run deploy:fuji
```

---

## 📋 Contract Interface

### Core Functions

```solidity
// Register a new AI model
function registerModel(string calldata dockerImageUrl)
    external returns (uint256 modelId)

// Rate a model (1-5 stars)
function rateModel(uint256 modelId, uint8 rating) external

// Select a model using weighted probability
function selectModel() external returns (uint256 modelId)

// Get top N models
function getTopModels(uint256 limit)
    external view returns (uint256[] memory, uint256[] memory)

// Get model details
function getModelInfo(uint256 modelId)
    external view returns (
        address owner,
        string memory dockerImageUrl,
        uint256 averageRating,
        uint256 ratingCount,
        uint256 timesSelected,
        bool isActive
    )

// Deactivate/Reactivate model
function deactivateModel(uint256 modelId) external
function reactivateModel(uint256 modelId) external

// Query functions
function getModelsByOwner(address ownerAddress)
    external view returns (uint256[] memory)
function hasUserRated(uint256 modelId, address user)
    external view returns (bool)
```

---

## 📊 Contract Constants

```solidity
MIN_RATING = 1
MAX_RATING = 5
TOP_MODEL_PROBABILITY = 70  // 70% chance for top model
```

---

## 🎯 Events

```solidity
event ModelRegistered(
    uint256 indexed modelId,
    address indexed owner,
    string dockerImageUrl,
    uint256 timestamp
)

event ModelRated(
    uint256 indexed modelId,
    address indexed rater,
    uint8 rating,
    uint256 newAverageRating
)

event ModelSelected(
    uint256 indexed modelId,
    address indexed owner,
    bool wasTopModel,
    uint256 timestamp
)

event ModelDeactivated(uint256 indexed modelId, uint256 timestamp)
event ModelReactivated(uint256 indexed modelId, uint256 timestamp)
```

---

## 💻 JavaScript/TypeScript Examples

### Setup

```typescript
import { ethers } from 'hardhat';

// Connect to deployed contract
const contractAddress = '0x...';
const ModelRegistry = await ethers.getContractFactory('ModelRegistry');
const contract = ModelRegistry.attach(contractAddress);
```

### Register a Model

```typescript
const dockerUrl = 'docker.io/my-org/my-model:v1.0';
const tx = await contract.registerModel(dockerUrl);
const receipt = await tx.wait();
console.log(`Model registered with ID: ${receipt.events[0].args.modelId}`);
```

### Rate a Model

```typescript
const modelId = 0;
const rating = 5;
await contract.rateModel(modelId, rating);
console.log(`Rated model ${modelId} with ${rating} stars`);
```

### Select a Model

```typescript
const tx = await contract.selectModel();
const receipt = await tx.wait();
const event = receipt.events?.find((e) => e.event === 'ModelSelected');
const selectedId = event?.args?.modelId;
console.log(`Selected model: ${selectedId}`);
```

### Get Model Info

```typescript
const modelId = 0;
const info = await contract.getModelInfo(modelId);
console.log({
  owner: info.owner,
  dockerUrl: info.dockerImageUrl,
  avgRating: (info.averageRating / 100n).toString(),
  ratingCount: info.ratingCount.toString(),
  timesSelected: info.timesSelected.toString(),
  isActive: info.isActive,
});
```

### Get Top Models

```typescript
const [modelIds, ratings] = await contract.getTopModels(10);
for (let i = 0; i < modelIds.length; i++) {
  console.log(`Model ${modelIds[i]}: Rating ${ratings[i] / 100n}`);
}
```

### Get Your Models

```typescript
const [signer] = await ethers.getSigners();
const myModels = await contract.getModelsByOwner(signer.address);
console.log(`You own models: ${myModels.join(', ')}`);
```

---

## 🌐 Network Addresses

### Fuji Testnet (Chain ID: 43113)

- **RPC:** https://api.avax-test.network/ext/bc/C/rpc
- **Explorer:** https://testnet.snowtrace.io
- **Faucet:** https://faucet.avax.network/

### Mainnet (Chain ID: 43114)

- **RPC:** https://api.avax.network/ext/bc/C/rpc
- **Explorer:** https://snowtrace.io

---

## 🧪 Testing Commands

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run coverage

# Run specific test
npx hardhat test --grep "Should register a new model"
```

---

## 🔧 Deployment

### Local Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

### Fuji Testnet

```bash
# 1. Set up .env
cp .env.example .env
# Edit .env with your private key

# 2. Get testnet AVAX
# Visit: https://faucet.avax.network/

# 3. Deploy
npm run deploy:fuji
```

### Mainnet (Production)

```bash
# ⚠️ USE WITH CAUTION - REAL AVAX!
npm run deploy:mainnet
```

---

## 🔍 Verification on Snowtrace

```bash
# Fuji Testnet
npx hardhat verify --network fuji <CONTRACT_ADDRESS>

# Mainnet
npx hardhat verify --network mainnet <CONTRACT_ADDRESS>
```

---

## 🐛 Common Issues & Solutions

### Issue: "Insufficient funds"

**Solution:** Get testnet AVAX from https://faucet.avax.network/

### Issue: "Nonce too high"

**Solution:** Reset your MetaMask account or use a fresh account

### Issue: "AlreadyRated" error

**Solution:** Each address can only rate each model once

### Issue: "ModelNotFound" error

**Solution:** Check that the model ID exists (< totalModels)

### Issue: "InvalidRating" error

**Solution:** Rating must be between 1 and 5

---

## 📊 Gas Estimates

Approximate gas costs on Avalanche:

| Operation        | Gas Used | Cost @ 25 nAVAX |
| ---------------- | -------- | --------------- |
| Register Model   | ~120,000 | ~0.003 AVAX     |
| Rate Model       | ~80,000  | ~0.002 AVAX     |
| Select Model     | ~60,000  | ~0.0015 AVAX    |
| Get Model Info   | ~30,000  | ~0.00075 AVAX   |
| Deactivate Model | ~50,000  | ~0.00125 AVAX   |

_Gas costs may vary based on network conditions_

---

## 🔐 Security Best Practices

1. ✅ Never commit `.env` file
2. ✅ Use separate wallets for testing and production
3. ✅ Verify contract source code on Snowtrace
4. ✅ Test thoroughly on Fuji before mainnet deployment
5. ✅ Consider multi-sig wallet for contract ownership
6. ✅ Monitor events for suspicious activity
7. ✅ Keep private keys secure and backed up

---

## 📱 Integration Example

### Frontend Integration (React + Ethers)

```typescript
import { ethers } from 'ethers';

// Connect to wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Connect to contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Register model
const registerModel = async (dockerUrl: string) => {
  const tx = await contract.registerModel(dockerUrl);
  await tx.wait();
  console.log('Model registered!');
};

// Rate model
const rateModel = async (modelId: number, rating: number) => {
  const tx = await contract.rateModel(modelId, rating);
  await tx.wait();
  console.log('Model rated!');
};

// Get top models
const getTopModels = async () => {
  const [ids, ratings] = await contract.getTopModels(10);
  return ids.map((id, i) => ({
    id: id.toString(),
    rating: Number(ratings[i]) / 100,
  }));
};
```

---

## 📚 Additional Resources

- **Hardhat Docs:** https://hardhat.org/docs
- **Ethers.js Docs:** https://docs.ethers.org/
- **Avalanche Docs:** https://docs.avax.network/
- **OpenZeppelin:** https://docs.openzeppelin.com/
- **Solidity Docs:** https://docs.soliditylang.org/

---

## 🆘 Need Help?

- **Discord:** https://chat.avalabs.org/
- **Forum:** https://forum.avax.network/
- **GitHub Issues:** https://github.com/ava-labs/avalanche-dapp-sdks/issues

---

**Last Updated:** October 28, 2025  
**Version:** 0.1.0

# ModelChain Smart Contracts

<div align="center">

**🤖 Decentralized AI Model Registry on Avalanche**

[![License](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow.svg)](https://hardhat.org/)

</div>

## 📖 Overview

ModelChain is a Web3 platform on Avalanche that allows developers to register AI models (Python scripts packaged in Docker containers), make them available on-chain, and enable users to rate and select them. The system uses a reputation-based selection algorithm that combines star ratings with controlled randomness to incentivize competition between models.

### Key Features

- 🚀 **Model Registration**: Developers can register AI models with Docker image URLs
- ⭐ **Rating System**: Users can rate models from 1-5 stars
- 🎯 **Smart Selection**: 70% probability for top-rated model, 30% random selection for diversity
- 📊 **Reputation Tracking**: Transparent, on-chain reputation for all models
- 🔒 **Access Control**: Model owners can activate/deactivate their models
- 📈 **Analytics**: Track selection counts and rating statistics

## 🏗️ Architecture

### ModelRegistry Contract

The main contract that handles all model operations:

```
ModelRegistry
├── Model Struct
│   ├── owner: address
│   ├── dockerImageUrl: string
│   ├── totalRating: uint256
│   ├── ratingCount: uint256
│   ├── timesSelected: uint256
│   ├── registrationTime: uint256
│   └── isActive: bool
│
├── Core Functions
│   ├── registerModel(dockerImageUrl)
│   ├── rateModel(modelId, rating)
│   ├── selectModel()
│   ├── getTopModels(limit)
│   ├── deactivateModel(modelId)
│   └── reactivateModel(modelId)
│
└── Query Functions
    ├── getModelInfo(modelId)
    ├── getModelsByOwner(ownerAddress)
    └── hasUserRated(modelId, user)
```

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- An Avalanche wallet with AVAX (testnet or mainnet)

### Installation

1. **Navigate to the contracts package:**

```bash
cd packages/model-chain-contracts
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```env
PRIVATE_KEY=your_private_key_here
```

⚠️ **Security Warning**: Never commit your `.env` file or share your private key!

### Get Testnet AVAX

For Fuji Testnet deployment, get free testnet AVAX from the faucet:

- 🔗 [Avalanche Fuji Faucet](https://faucet.avax.network/)

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

Run tests with gas reporting:

```bash
REPORT_GAS=true npm test
```

Run tests with coverage:

```bash
npm run coverage
```

### Test Coverage

The test suite covers:

- ✅ Model registration and validation
- ✅ Rating system with edge cases
- ✅ Selection algorithm statistics
- ✅ Access control and permissions
- ✅ Model activation/deactivation
- ✅ Query functions
- ✅ Event emissions

## 📦 Compilation

Compile the contracts:

```bash
npm run build
```

This generates:

- Contract artifacts in `artifacts/`
- TypeScript type definitions in `typechain-types/`

## 🌐 Deployment

### Deploy to Local Hardhat Network

1. **Start local node:**

```bash
npm run node
```

2. **Deploy (in another terminal):**

```bash
npm run deploy:local
```

### Deploy to Avalanche Fuji Testnet

```bash
npm run deploy:fuji
```

### Deploy to Avalanche Mainnet

⚠️ **Use with caution - this uses real AVAX!**

```bash
npm run deploy:mainnet
```

### Deployment Output

The deployment script provides:

- ✅ Contract address
- ✅ Owner address
- ✅ Transaction hash
- ✅ Snowtrace explorer link
- ✅ Configuration parameters
- ✅ Next steps guidance

Example output:

```
🚀 Starting ModelRegistry deployment...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Deployment Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deploying from account: 0x1234...5678
Network: fuji (Chain ID: 43113)
Account balance: 10.5 AVAX

📝 Deploying ModelRegistry contract...

✅ Contract deployed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contract address: 0xABCD...EFGH
Owner: 0x1234...5678
Transaction hash: 0x9876...5432

🔍 View on Snowtrace: https://testnet.snowtrace.io/address/0xABCD...EFGH
```

## 🔧 Interacting with the Contract

### Using the Interaction Script

1. **Update the contract address in `scripts/interact.ts`:**

```typescript
const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

2. **Run the script:**

```bash
npx hardhat run scripts/interact.ts --network fuji
```

### Using Hardhat Console

```bash
npx hardhat console --network fuji
```

Then interact with the contract:

```javascript
const ModelRegistry = await ethers.getContractFactory('ModelRegistry');
const contract = await ModelRegistry.attach('0xYourContractAddress');

// Register a model
await contract.registerModel('docker.io/my-org/my-model:v1');

// Rate a model
await contract.rateModel(0, 5);

// Get model info
const info = await contract.getModelInfo(0);
console.log(info);

// Select a model
const tx = await contract.selectModel();
await tx.wait();
```

## 📚 Contract Functions

### For Developers

#### `registerModel(string dockerImageUrl)`

Register a new AI model.

**Parameters:**

- `dockerImageUrl`: URL to the Docker image (e.g., `docker.io/org/model:tag`)

**Returns:** `modelId` (uint256)

**Events:** `ModelRegistered(modelId, owner, dockerImageUrl, timestamp)`

**Example:**

```solidity
uint256 modelId = modelRegistry.registerModel("docker.io/ai-models/gpt-model:v1");
```

#### `deactivateModel(uint256 modelId)`

Deactivate your model (or any model if you're the contract owner).

#### `reactivateModel(uint256 modelId)`

Reactivate a previously deactivated model.

### For Users

#### `rateModel(uint256 modelId, uint8 rating)`

Rate a model (1-5 stars). Each address can only rate each model once.

**Parameters:**

- `modelId`: ID of the model to rate
- `rating`: Rating value (1-5)

**Events:** `ModelRated(modelId, rater, rating, newAverageRating)`

**Example:**

```solidity
modelRegistry.rateModel(0, 5); // Give 5 stars to model 0
```

#### `selectModel()`

Select a model for execution using the weighted random algorithm.

**Returns:** `modelId` (uint256)

**Events:** `ModelSelected(modelId, owner, wasTopModel, timestamp)`

**Example:**

```solidity
uint256 selectedModelId = modelRegistry.selectModel();
```

### Query Functions

#### `getModelInfo(uint256 modelId)`

Get detailed information about a model.

**Returns:**

- `owner`: Model owner address
- `dockerImageUrl`: Docker image URL
- `averageRating`: Average rating (scaled by 100)
- `ratingCount`: Number of ratings
- `timesSelected`: Times the model was selected
- `isActive`: Whether model is active

#### `getTopModels(uint256 limit)`

Get the top-rated models.

**Parameters:**

- `limit`: Maximum number of models to return

**Returns:**

- `modelIds[]`: Array of model IDs
- `ratings[]`: Array of weighted ratings

#### `getModelsByOwner(address ownerAddress)`

Get all models owned by an address.

**Returns:** `modelIds[]` (uint256[])

#### `hasUserRated(uint256 modelId, address user)`

Check if a user has rated a specific model.

**Returns:** `bool`

## 🎯 Selection Algorithm

The model selection uses a weighted probability system:

1. **70% Probability**: Top-rated model is selected
2. **30% Probability**: Random model is selected (for diversity)

This approach:

- ✅ Rewards high-quality models with more selections
- ✅ Gives new/experimental models a chance
- ✅ Prevents monopolization
- ✅ Encourages continuous improvement

### Rating Calculation

Models are ranked using a weighted rating:

```
weightedRating = (averageRating * 100) + credibilityBonus

where:
  averageRating = totalRating / ratingCount
  credibilityBonus = min(ratingCount / 5, 10)
```

The credibility bonus gives a small advantage to models with more ratings (capped at 50 ratings).

## 🔐 Security Features

- ✅ **ReentrancyGuard**: Prevents reentrancy attacks
- ✅ **Access Control**: Owner-based permissions via OpenZeppelin
- ✅ **Input Validation**: All inputs are validated
- ✅ **Custom Errors**: Gas-efficient error handling
- ✅ **Event Logging**: Complete audit trail

### Security Considerations

⚠️ **Randomness**: The current implementation uses block-based pseudo-randomness. For production, consider using [Chainlink VRF](https://docs.chain.link/vrf/v2/introduction) for provably fair randomness.

## 📊 Events

All contract actions emit events for off-chain tracking:

```solidity
event ModelRegistered(uint256 indexed modelId, address indexed owner, string dockerImageUrl, uint256 timestamp);
event ModelRated(uint256 indexed modelId, address indexed rater, uint8 rating, uint256 newAverageRating);
event ModelSelected(uint256 indexed modelId, address indexed owner, bool wasTopModel, uint256 timestamp);
event ModelDeactivated(uint256 indexed modelId, uint256 timestamp);
event ModelReactivated(uint256 indexed modelId, uint256 timestamp);
```

## 🛠️ Development

### Project Structure

```
model-chain-contracts/
├── contracts/
│   └── ModelRegistry.sol       # Main contract
├── scripts/
│   ├── deploy.ts               # Deployment script
│   └── interact.ts             # Interaction examples
├── test/
│   └── ModelRegistry.test.ts   # Comprehensive test suite
├── hardhat.config.ts           # Hardhat configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

### Available Scripts

- `npm run build` - Compile contracts
- `npm test` - Run tests
- `npm run coverage` - Generate coverage report
- `npm run node` - Start local Hardhat node
- `npm run deploy:local` - Deploy to local network
- `npm run deploy:fuji` - Deploy to Fuji testnet
- `npm run clean` - Clean artifacts and cache

## 🌍 Network Configuration

### Supported Networks

| Network                | Chain ID | RPC URL                                    | Explorer                     |
| ---------------------- | -------- | ------------------------------------------ | ---------------------------- |
| Avalanche Fuji Testnet | 43113    | https://api.avax-test.network/ext/bc/C/rpc | https://testnet.snowtrace.io |
| Avalanche Mainnet      | 43114    | https://api.avax.network/ext/bc/C/rpc      | https://snowtrace.io         |
| Hardhat Local          | 31337    | http://127.0.0.1:8545                      | N/A                          |

## 📝 Example Use Case

### Complete Workflow

1. **Developer registers model:**

   ```javascript
   await modelRegistry.registerModel(
     'docker.io/ai-models/sentiment-analyzer:v1'
   );
   ```

2. **Users rate the model:**

   ```javascript
   await modelRegistry.rateModel(0, 5); // User 1 rates 5 stars
   await modelRegistry.rateModel(0, 4); // User 2 rates 4 stars
   ```

3. **System selects model for execution:**

   ```javascript
   const selectedId = await modelRegistry.selectModel();
   const modelInfo = await modelRegistry.getModelInfo(selectedId);
   // Use modelInfo.dockerImageUrl to execute the model
   ```

4. **Track performance:**
   ```javascript
   const topModels = await modelRegistry.getTopModels(10);
   // Display leaderboard to users
   ```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the BSD-3-Clause License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 [Avalanche Documentation](https://docs.avax.network/)
- 💬 [Avalanche Discord](https://chat.avalabs.org/)
- 🐛 [Report Issues](https://github.com/ava-labs/avalanche-dapp-sdks/issues)

## 🔗 Related Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Avalanche Subnets](https://docs.avax.network/subnets)
- [Snowtrace Block Explorer](https://snowtrace.io/)

---

<div align="center">

**Built with ❤️ for the Avalanche ecosystem**

[Website](https://avax.network) • [Twitter](https://twitter.com/avalancheavax) • [Discord](https://chat.avalabs.org)

</div>

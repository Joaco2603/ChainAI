<div align="center">

<img src="./assets/ChainAI.jpg" alt="ChainAI" width="20" height="20">

# ChainAI DApp SDKs

**🤖 Decentralized AI Model Registry on Avalanche**

[![License](https://img.shields.io/badge/License-BSD--3--Clause-blue.svg)](LICENSE)
[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?logo=avalanche&logoColor=white)](https://avax.network)
[![Lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

[Features](#-features) • [Getting Started](#-getting-started) • [Packages](#-packages) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**ChainAI** is a Web3 platform on Avalanche that enables developers to upload AI models (Python scripts packaged in Docker containers), register them on-chain, and make them available to the community.

### How It Works

1. **🚀 Developers** register AI models with Docker image URLs
2. **⭐ Users** rate models based on performance (1-5 stars)
3. **🎯 System** automatically selects models using a reputation-based algorithm:
   - **70%** probability for the top-rated model
   - **30%** random selection for diversity and competition
4. **📈 Best models** get more usage, creating a sustainable and transparent reputation mechanism

This incentivizes continuous improvement and fair competition among AI models!

---

## ✨ Features

- 🔗 **On-Chain Model Registry** - Transparent and immutable model registration
- ⭐ **Reputation System** - Community-driven ratings (1-5 stars)
- 🎲 **Smart Selection Algorithm** - Weighted probability with diversity
- 🔒 **Secure & Audited** - Built with OpenZeppelin standards
- 🚀 **Production Ready** - Comprehensive tests and documentation
- 🌐 **Multi-Network** - Supports Fuji Testnet and Mainnet
- 📦 **Monorepo Structure** - Easy to maintain and extend

---

## 📦 Packages

This monorepo contains the following packages:

### 🎯 Smart Contracts

- **[`@avalabs/model-chain-contracts`](packages/model-chain-contracts)** - Core smart contracts for ModelChain
  - ModelRegistry contract with rating and selection logic
  - Comprehensive test suite (41 tests, 100% passing)
  - Deployment scripts for Avalanche networks
  - Full TypeScript support

### 🔌 Web3 Integrations

- **`@avalabs/contacts`** - Contact management utilities
- **`@avalabs/web3-react-core-connector`** - Web3 React connector for Avalanche
- **`@avalabs/web3-react-dapp-example`** - Example DApp implementation

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16 or higher
- Yarn package manager
- An Avalanche wallet (for deployment)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/ava-labs/avalanche-dapp-sdks.git
cd avalanche-dapp-sdks
```

2. **Bootstrap the project:**

```bash
yarn bootstrap
```

This will install all dependencies, build packages, and link them together.

### Quick Start with Smart Contracts

```bash
# Navigate to contracts package
cd packages/model-chain-contracts

# Run tests
npm test

# Deploy to Fuji testnet
npm run deploy:fuji
```

### Running the Example DApp

1. Make sure you've completed the bootstrap step above
2. Navigate to the example package:

```bash
cd packages/web3-react-dapp-example
```

3. Start the development server:

```bash
yarn start
```

---

## 📚 Documentation

### Smart Contracts Documentation

- **[Main README](packages/model-chain-contracts/README.md)** - Comprehensive guide
- **[Quick Reference](packages/model-chain-contracts/QUICK_REFERENCE.md)** - Quick start guide
- **[Implementation Summary](packages/model-chain-contracts/IMPLEMENTATION_SUMMARY.md)** - Project overview
- **[Changelog](packages/model-chain-contracts/CHANGELOG.md)** - Version history

### Key Contract Functions

```solidity
// Register a new AI model
registerModel(string dockerImageUrl) returns (uint256 modelId)

// Rate a model (1-5 stars)
rateModel(uint256 modelId, uint8 rating)

// Select a model using weighted probability
selectModel() returns (uint256 modelId)

// Get top-rated models
getTopModels(uint256 limit) returns (uint256[], uint256[])
```

See the [contracts documentation](packages/model-chain-contracts/README.md) for complete details.

---

## 🧪 Testing

### Run All Tests

```bash
# From root
yarn test

# Or for specific package
cd packages/model-chain-contracts
npm test
```

### Test Coverage

The smart contracts have **100% test coverage** with 41 passing tests covering:

- Model registration and validation
- Rating system with constraints
- Selection algorithm (statistical verification)
- Access control and permissions
- Edge cases and error handling

---

## 🔧 Development Workflow

### Alpha Release

To deploy an alpha release:

1. Use a [conventional commit message](https://www.conventionalcommits.org/en/v1.0.0/)
2. Checkout the `alpha-release` branch
3. Push your changes

This will automatically trigger the build and release process.

**Note:** Ensure all code is properly reviewed via PR before merging to master.

### Production Release

Alpha releases are automated, but production releases are manual.

**To create a production release:**

1. Pull the latest `alpha-release` branch:

```bash
git checkout alpha-release
git pull
```

2. Create a release version:

```bash
lerna version --conventional-commits --conventional-graduate --exact --message "Production Release %s"
```

3. Create a PR from `alpha-release` to `master`
4. Squash and merge (this will publish the new version)

---

## 🌐 Network Configuration

### Avalanche Fuji Testnet

- **Chain ID:** 43113
- **RPC:** https://api.avax-test.network/ext/bc/C/rpc
- **Explorer:** https://testnet.snowtrace.io
- **Faucet:** https://faucet.avax.network/

### Avalanche Mainnet

- **Chain ID:** 43114
- **RPC:** https://api.avax.network/ext/bc/C/rpc
- **Explorer:** https://snowtrace.io

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Use conventional commits for your changes
4. Write or update tests as needed
5. Ensure all tests pass (`yarn test`)
6. Submit a pull request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
test: add or update tests
chore: maintenance tasks
```

---

## 📄 License

This project is licensed under the **BSD-3-Clause License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Resources

- **[Avalanche Documentation](https://docs.avax.network/)** - Official Avalanche docs
- **[Hardhat Documentation](https://hardhat.org/docs)** - Smart contract development
- **[OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)** - Secure contract library
- **[Lerna Documentation](https://lerna.js.org/)** - Monorepo management

---

## 🆘 Support

- **Discord:** [Avalanche Chat](https://chat.avalabs.org/)
- **Forum:** [Avalanche Forum](https://forum.avax.network/)
- **GitHub Issues:** [Report Issues](https://github.com/ava-labs/avalanche-dapp-sdks/issues)

---

<div align="center">

**Built with ❤️ for the Avalanche ecosystem**

[Website](https://avax.network) • [Twitter](https://twitter.com/avalancheavax) • [Discord](https://chat.avalabs.org)

</div>

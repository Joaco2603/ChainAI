# ModelChain Contracts Changelog

All notable changes to the ModelChain smart contracts will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-28

### Added

- Initial release of ModelRegistry smart contract
- Model registration functionality with Docker image URLs
- Rating system (1-5 stars) with single-rating-per-user enforcement
- Weighted selection algorithm (70% top model, 30% random)
- Model activation/deactivation by owners
- Comprehensive query functions:
  - `getModelInfo()` - Get detailed model information
  - `getTopModels()` - Get ranked list of top models
  - `getModelsByOwner()` - Get all models by specific owner
  - `hasUserRated()` - Check if user has rated a model
- Events for all major actions:
  - `ModelRegistered`
  - `ModelRated`
  - `ModelSelected`
  - `ModelDeactivated`
  - `ModelReactivated`
- Security features:
  - ReentrancyGuard protection
  - Ownable access control
  - Input validation
  - Custom errors for gas efficiency
- Deployment scripts for:
  - Local Hardhat network
  - Avalanche Fuji Testnet
  - Avalanche Mainnet
- Comprehensive test suite with 50+ test cases
- Interaction scripts for contract management
- Complete documentation and examples

### Security

- Implements OpenZeppelin's ReentrancyGuard
- Implements OpenZeppelin's Ownable for access control
- Custom error messages for gas-efficient error handling
- Input validation on all user-facing functions

### Notes

- Uses Solidity 0.8.20
- Compatible with Hardhat and Ethers v6
- Optimized for Avalanche C-Chain deployment
- Current randomness implementation is pseudo-random (consider Chainlink VRF for production)

## [Unreleased]

### Planned Features

- Integration with Chainlink VRF for provably fair randomness
- Model version management
- Categories/tags for models
- Payment/rewards system for model usage
- Staking mechanism for model quality assurance
- Batch operations for gas optimization
- Model performance metrics tracking
- Dispute resolution mechanism

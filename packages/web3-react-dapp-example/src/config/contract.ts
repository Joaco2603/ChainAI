// Contract configuration and ABI
export const CONTRACT_ADDRESS = '0xYourContractAddressHere'; // Update with deployed contract address
export const BACKEND_URL = 'http://localhost:8000/api/v1';

// ModelRegistry Contract ABI (only the functions we need)
export const MODEL_REGISTRY_ABI = [
  'function registerModel(string memory _dockerImageUrl) public returns (uint256)',
  'function rateModel(uint256 _modelId, uint8 _rating) public',
  'function selectModel() public view returns (uint256)',
  'function getModel(uint256 _modelId) public view returns (address owner, string memory dockerImageUrl, uint256 averageRating, uint256 ratingCount, uint256 timesSelected, bool isActive)',
  'function getTopModels(uint256 _limit) public view returns (uint256[] memory)',
  'function getModelCount() public view returns (uint256)',
  'function deactivateModel(uint256 _modelId) public',
  'event ModelRegistered(uint256 indexed modelId, address indexed owner, string dockerImageUrl, uint256 timestamp)',
  'event ModelRated(uint256 indexed modelId, address indexed rater, uint8 rating, uint256 newAverageRating, uint256 timestamp)',
  'event ModelSelected(uint256 indexed modelId, uint256 timestamp)',
];

// Chain configuration
export const AVALANCHE_FUJI_PARAMS = {
  chainId: '0xA869', // 43113 in hex
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

export const AVALANCHE_MAINNET_PARAMS = {
  chainId: '0xA86A', // 43114 in hex
  chainName: 'Avalanche Network',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://snowtrace.io/'],
};

import { ethers } from 'hardhat';

async function main() {
  console.log('🚀 Starting ModelRegistry deployment...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log('\n📋 Deployment Information:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Deploying from account: ${deployer.address}`);
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} AVAX`);

  // Check if balance is sufficient
  if (balance < ethers.parseEther('0.1')) {
    console.warn(
      '\n⚠️  WARNING: Low balance! You may need more AVAX for deployment.'
    );
    console.log('Get testnet AVAX from: https://faucet.avax.network/');
  }

  console.log('\n📝 Deploying ModelRegistry contract...');

  // Get contract factory
  const ModelRegistryFactory = await ethers.getContractFactory('ModelRegistry');

  // Deploy contract
  const modelRegistry = await ModelRegistryFactory.deploy();
  await modelRegistry.waitForDeployment();

  const contractAddress = await modelRegistry.getAddress();

  console.log('\n✅ Contract deployed successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Owner: ${await modelRegistry.owner()}`);
  console.log(
    `Transaction hash: ${modelRegistry.deploymentTransaction()?.hash}`
  );

  // Display network-specific explorer link
  let explorerUrl = '';
  if (network.chainId === 43113n) {
    // Fuji Testnet
    explorerUrl = `https://testnet.snowtrace.io/address/${contractAddress}`;
  } else if (network.chainId === 43114n) {
    // Mainnet
    explorerUrl = `https://snowtrace.io/address/${contractAddress}`;
  } else if (network.chainId === 31337n) {
    // Local network
    explorerUrl = 'Local network - no explorer available';
  }

  if (explorerUrl && network.chainId !== 31337n) {
    console.log(`\n🔍 View on Snowtrace: ${explorerUrl}`);
  }

  // Display contract constants
  console.log('\n📊 Contract Configuration:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Min Rating: ${await modelRegistry.MIN_RATING()}`);
  console.log(`Max Rating: ${await modelRegistry.MAX_RATING()}`);
  console.log(
    `Top Model Probability: ${await modelRegistry.TOP_MODEL_PROBABILITY()}%`
  );

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: modelRegistry.deploymentTransaction()?.hash,
    explorerUrl: explorerUrl,
  };

  console.log(
    '\n💾 Deployment info saved to console. Copy this for your records:'
  );
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log('\n✨ Deployment complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // If on Fuji, provide next steps
  if (network.chainId === 43113n) {
    console.log('\n📚 Next Steps:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. Verify your contract on Snowtrace (optional):');
    console.log(`   npx hardhat verify --network fuji ${contractAddress}`);
    console.log('\n2. Test the contract:');
    console.log('   - Register a model: registerModel(dockerImageUrl)');
    console.log('   - Rate models: rateModel(modelId, rating)');
    console.log('   - Select a model: selectModel()');
    console.log('\n3. Integrate with your frontend application');
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed!');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(error);
    process.exit(1);
  });

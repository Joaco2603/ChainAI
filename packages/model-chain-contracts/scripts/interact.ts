import { ethers } from 'hardhat';

/**
 * Script to interact with deployed ModelRegistry contract
 * Update CONTRACT_ADDRESS with your deployed contract address
 */

const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE';

async function main() {
  console.log('🔗 Connecting to ModelRegistry contract...\n');

  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}\n`);

  // Get contract instance
  const ModelRegistry = await ethers.getContractFactory('ModelRegistry');
  const modelRegistry = ModelRegistry.attach(CONTRACT_ADDRESS);

  // Example operations - uncomment the ones you want to run

  // 1. Register a model
  console.log('1️⃣  Registering a new model...');
  const dockerUrl = 'docker.io/your-org/your-model:v1.0';
  const tx1 = await modelRegistry.registerModel(dockerUrl);
  await tx1.wait();
  console.log(`✅ Model registered! Transaction: ${tx1.hash}\n`);

  // 2. Get total models
  const totalModels = await modelRegistry.totalModels();
  console.log(`📊 Total models: ${totalModels}\n`);

  // 3. Rate a model (modelId 0, rating 5)
  // console.log("2️⃣  Rating model...");
  // const tx2 = await modelRegistry.rateModel(0, 5);
  // await tx2.wait();
  // console.log(`✅ Model rated! Transaction: ${tx2.hash}\n`);

  // 4. Get model info
  if (totalModels > 0) {
    console.log('3️⃣  Getting model info for model 0...');
    const modelInfo = await modelRegistry.getModelInfo(0);
    console.log('Model Information:');
    console.log(`  Owner: ${modelInfo.owner}`);
    console.log(`  Docker URL: ${modelInfo.dockerImageUrl}`);
    console.log(`  Average Rating: ${modelInfo.averageRating / 100n}`);
    console.log(`  Rating Count: ${modelInfo.ratingCount}`);
    console.log(`  Times Selected: ${modelInfo.timesSelected}`);
    console.log(`  Is Active: ${modelInfo.isActive}\n`);
  }

  // 5. Get top models
  // console.log("4️⃣  Getting top 5 models...");
  // const [topModelIds, ratings] = await modelRegistry.getTopModels(5);
  // console.log("Top Models:");
  // for (let i = 0; i < topModelIds.length; i++) {
  //   console.log(`  Model ${topModelIds[i]}: Rating ${ratings[i] / 100n}`);
  // }
  // console.log();

  // 6. Select a model
  // console.log("5️⃣  Selecting a model...");
  // const tx3 = await modelRegistry.selectModel();
  // const receipt = await tx3.wait();
  // console.log(`✅ Model selected! Transaction: ${tx3.hash}\n`);

  // 7. Get models by owner
  // const ownerModels = await modelRegistry.getModelsByOwner(signer.address);
  // console.log(`📋 Your models: ${ownerModels.join(", ")}\n`);

  console.log('✨ Done!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

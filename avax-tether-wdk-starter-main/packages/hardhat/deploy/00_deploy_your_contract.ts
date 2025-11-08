import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the ModelRegistry contract for ChainAI
 * 
 * This contract manages:
 * - AI Model registration (Docker images)
 * - Rating system (1-5 stars)
 * - Weighted selection algorithm (70% top / 30% random)
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployModelRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network fuji`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🤖 Deploying ChainAI ModelRegistry contract...");
  console.log("📍 Deployer address:", deployer);
  console.log("🌐 Network:", hre.network.name);

  const modelRegistry = await deploy("ModelRegistry", {
    from: deployer,
    // No constructor arguments needed for ModelRegistry
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("✅ ModelRegistry deployed at:", modelRegistry.address);

  // Get the deployed contract to interact with it after deploying.
  const contract = await hre.ethers.getContract<Contract>("ModelRegistry", deployer);
  
  // Log initial state
  const modelCount = await contract.totalModels();
  console.log("📊 Initial model count:", modelCount.toString());

  // Optional: Register a demo model for testing on local networks
  if (hre.network.name === "avalancheLocal" || hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("\n🧪 Registering demo model for testing...");
    
    try {
      const tx = await contract.registerModel("docker.io/chainai/sentiment-analysis:v1.0.0");
      await tx.wait();
      
      console.log("✅ Demo model registered successfully!");
      console.log("📝 Model ID: 0");
      console.log("🐳 Docker Image: docker.io/chainai/sentiment-analysis:v1.0.0");
      
      // Verify the model was registered
      const newModelCount = await contract.totalModels();
      console.log("📊 Updated model count:", newModelCount.toString());
    } catch (error) {
      console.log("⚠️  Could not register demo model:", error);
    }
  }

  console.log("\n🎉 ChainAI ModelRegistry deployment complete!\n");
};

export default deployModelRegistry;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ModelRegistry
deployModelRegistry.tags = ["ModelRegistry", "ChainAI"];

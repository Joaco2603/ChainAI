import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploys ZK-enhanced ModelRegistry contracts
 *
 * @param hre HardhatRuntimeEnvironment object
 */
const deployZKContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n========================================");
  console.log("Deploying ZK Contracts");
  console.log("========================================\n");

  // Check if verifier contracts exist
  const inputVerifierPath = path.join(__dirname, "..", "contracts", "verifiers", "input_verifier_verifier.sol");
  const outputVerifierPath = path.join(__dirname, "..", "contracts", "verifiers", "output_verifier_verifier.sol");

  let inputVerifierAddress = "";
  let outputVerifierAddress = "";

  if (fs.existsSync(inputVerifierPath) && fs.existsSync(outputVerifierPath)) {
    console.log("✓ Verifier contracts found, deploying...\n");

    // Deploy Input Verifier
    const inputVerifier = await deploy("Input_verifier_verifier", {
      contract: {
        abi: [],
        bytecode: "0x", // Will be compiled from generated file
      },
      from: deployer,
      log: true,
      autoMine: true,
    });

    inputVerifierAddress = inputVerifier.address;
    console.log(`✓ Input Verifier deployed at: ${inputVerifierAddress}\n`);

    // Deploy Output Verifier
    const outputVerifier = await deploy("Output_verifier_verifier", {
      contract: {
        abi: [],
        bytecode: "0x",
      },
      from: deployer,
      log: true,
      autoMine: true,
    });

    outputVerifierAddress = outputVerifier.address;
    console.log(`✓ Output Verifier deployed at: ${outputVerifierAddress}\n`);
  } else {
    console.log("⚠ Verifier contracts not found. Please run 'yarn zk:compile' first.");
    console.log("Deploying ModelRegistryZK without verifiers (can be set later)...\n");
  }

  // Deploy ModelRegistryZK
  const modelRegistryZK = await deploy("ModelRegistryZK", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log(`✓ ModelRegistryZK deployed at: ${modelRegistryZK.address}\n`);

  // Set verifiers if deployed
  if (inputVerifierAddress && outputVerifierAddress) {
    console.log("Setting verifiers on ModelRegistryZK...");

    const ModelRegistryZK = await hre.ethers.getContractFactory("ModelRegistryZK");
    const registry = ModelRegistryZK.attach(modelRegistryZK.address);

    try {
      const tx1 = await registry.setInputVerifier(inputVerifierAddress);
      await tx1.wait();
      console.log("✓ Input verifier set");

      const tx2 = await registry.setOutputVerifier(outputVerifierAddress);
      await tx2.wait();
      console.log("✓ Output verifier set\n");
    } catch (error) {
      console.log("⚠ Error setting verifiers (they can be set manually later)");
      console.log(error);
    }
  }

  console.log("========================================");
  console.log("ZK Deployment Complete!");
  console.log("========================================\n");

  console.log("Contract Addresses:");
  console.log(`  ModelRegistryZK: ${modelRegistryZK.address}`);
  if (inputVerifierAddress) {
    console.log(`  Input Verifier: ${inputVerifierAddress}`);
  }
  if (outputVerifierAddress) {
    console.log(`  Output Verifier: ${outputVerifierAddress}`);
  }
  console.log("");

  console.log("Next steps:");
  console.log("1. Verify contracts on block explorer (if on public network)");
  console.log("2. Register models using registerModel()");
  console.log("3. Generate and verify ZK proofs using utility scripts");
  console.log("4. Test the full ZK flow with test-zk-proof.ts");
  console.log("");
};

export default deployZKContracts;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ModelRegistryZK
deployZKContracts.tags = ["ModelRegistryZK", "ZK"];


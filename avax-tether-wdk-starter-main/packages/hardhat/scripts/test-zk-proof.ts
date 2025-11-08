import {
  generateInputProof,
  verifyInputProof,
  generateOutputProof,
  verifyOutputProof,
  saveProof,
  formatProofForSolidity,
} from "./zkUtils";

/**
 * Test script for ZK proof generation and verification
 * Run with: yarn zk:test
 */

async function main() {
  console.log("========================================");
  console.log("Testing ZK Proof System");
  console.log("========================================\n");

  try {
    // Test 1: Input Verification Proof
    console.log("Test 1: Input Verification");
    console.log("---------------------------");

    const inputData = [10, 20, 30, 40, 50];
    const minValue = 0;
    const maxValue = 100;

    console.log(`Input data: [${inputData.join(", ")}]`);
    console.log(`Range: [${minValue}, ${maxValue}]\n`);

    const { proof: inputProof, publicSignals: inputSignals } =
      await generateInputProof(inputData, minValue, maxValue);

    console.log("Public signals:", inputSignals);

    // Save proof
    saveProof("input_verifier", inputProof, inputSignals);

    // Verify proof locally
    const inputValid = await verifyInputProof(inputProof, inputSignals);

    if (!inputValid) {
      throw new Error("Input proof verification failed!");
    }

    // Format for Solidity
    const inputSolidityProof = formatProofForSolidity(inputProof, inputSignals);
    console.log("\nSolidity-formatted proof (sample):");
    console.log("a:", inputSolidityProof.a);
    console.log("b:", inputSolidityProof.b);
    console.log("c:", inputSolidityProof.c);
    console.log("input:", inputSolidityProof.input);

    console.log("\n✅ Test 1 PASSED\n");

    // Test 2: Output Verification Proof
    console.log("Test 2: Output Verification");
    console.log("----------------------------");

    const outputData = [100, 200, 150, 180, 220]; // Model outputs
    const outputMinValue = 0;
    const outputMaxValue = 1000;
    const modelId = 1;
    const modelSecret = BigInt("12345678901234567890"); // Should be kept secret

    console.log(`Output data: [${outputData.join(", ")}]`);
    console.log(`Range: [${outputMinValue}, ${outputMaxValue}]`);
    console.log(`Model ID: ${modelId}\n`);

    const { proof: outputProof, publicSignals: outputSignals } =
      await generateOutputProof(
        outputData,
        outputMinValue,
        outputMaxValue,
        modelId,
        modelSecret,
      );

    console.log("Public signals:", outputSignals);

    // Save proof
    saveProof("output_verifier", outputProof, outputSignals);

    // Verify proof locally
    const outputValid = await verifyOutputProof(outputProof, outputSignals);

    if (!outputValid) {
      throw new Error("Output proof verification failed!");
    }

    // Format for Solidity
    const outputSolidityProof = formatProofForSolidity(outputProof, outputSignals);
    console.log("\nSolidity-formatted proof (sample):");
    console.log("a:", outputSolidityProof.a);
    console.log("b:", outputSolidityProof.b);
    console.log("c:", outputSolidityProof.c);
    console.log("input:", outputSolidityProof.input);

    console.log("\n✅ Test 2 PASSED\n");

    // Test 3: Invalid input (should fail)
    console.log("Test 3: Invalid Input (Out of Range)");
    console.log("-------------------------------------");

    const invalidInputData = [10, 20, 150, 40, 50]; // 150 is out of range
    console.log(`Invalid input data: [${invalidInputData.join(", ")}]`);
    console.log(`Range: [${minValue}, ${maxValue}]\n`);

    try {
      await generateInputProof(invalidInputData, minValue, maxValue);
      console.log("❌ Test 3 FAILED: Should have rejected invalid input");
    } catch (error) {
      console.log("✅ Test 3 PASSED: Invalid input correctly rejected");
      console.log(`Error: ${error.message}\n`);
    }

    console.log("\n========================================");
    console.log("All Tests Completed Successfully! 🎉");
    console.log("========================================");
    console.log("\nYou can now:");
    console.log("1. Deploy contracts with: yarn deploy");
    console.log("2. Test on-chain verification in contract tests");
    console.log("3. Integrate with your frontend\n");
  } catch (error) {
    console.error("\n❌ Error during testing:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


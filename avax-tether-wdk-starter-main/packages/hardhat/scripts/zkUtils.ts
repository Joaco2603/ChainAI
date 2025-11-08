import * as snarkjs from "snarkjs";
import * as fs from "fs";
import * as path from "path";
import { poseidon } from "circomlibjs";

/**
 * ZK Proof Utilities for ChainAI
 * Provides functions for generating and verifying zero-knowledge proofs
 */

const KEYS_DIR = path.join(__dirname, "..", "zkproof", "keys");
const INPUT_DIR = path.join(__dirname, "..", "zkproof", "input");
const OUTPUT_DIR = path.join(__dirname, "..", "zkproof", "output");

/**
 * Generate a Poseidon hash of input data
 */
export async function generatePoseidonHash(inputs: bigint[]): Promise<bigint> {
  const hash = await poseidon(inputs);
  return hash;
}

/**
 * Generate a proof for input verification
 */
export async function generateInputProof(
  inputData: number[],
  minValue: number,
  maxValue: number,
): Promise<{ proof: any; publicSignals: any }> {
  console.log("Generating input verification proof...");

  // Ensure input data has correct length (pad with zeros if needed)
  const maxInputSize = 10;
  const paddedInput = [...inputData];
  while (paddedInput.length < maxInputSize) {
    paddedInput.push(0);
  }

  // Generate hash of input data
  const inputDataBigInt = paddedInput.map(x => BigInt(x));
  const inputHash = await generatePoseidonHash(inputDataBigInt);

  // Prepare circuit inputs
  const input = {
    inputHash: inputHash.toString(),
    minValue: minValue.toString(),
    maxValue: maxValue.toString(),
    inputData: paddedInput.map(x => x.toString()),
    inputLength: inputData.length.toString(),
  };

  // Save input to file for debugging
  const inputFile = path.join(INPUT_DIR, "input_verifier_input.json");
  fs.mkdirSync(INPUT_DIR, { recursive: true });
  fs.writeFileSync(inputFile, JSON.stringify(input, null, 2));

  // Generate witness
  const wasmFile = path.join(KEYS_DIR, "input_verifier", "input_verifier_js", "input_verifier.wasm");
  const zkeyFile = path.join(KEYS_DIR, "input_verifier", "input_verifier_0001.zkey");

  if (!fs.existsSync(wasmFile)) {
    throw new Error(
      `WASM file not found: ${wasmFile}\nPlease run 'yarn zk:compile' first.`,
    );
  }

  if (!fs.existsSync(zkeyFile)) {
    throw new Error(
      `Proving key not found: ${zkeyFile}\nPlease run 'yarn zk:compile' first.`,
    );
  }

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmFile,
    zkeyFile,
  );

  console.log("✓ Input proof generated successfully");
  return { proof, publicSignals };
}

/**
 * Generate a proof for output verification
 */
export async function generateOutputProof(
  outputData: number[],
  minValue: number,
  maxValue: number,
  modelId: number,
  modelSecret: bigint,
): Promise<{ proof: any; publicSignals: any }> {
  console.log("Generating output verification proof...");

  // Ensure output data has correct length (pad with zeros if needed)
  const outputSize = 10;
  const paddedOutput = [...outputData];
  while (paddedOutput.length < outputSize) {
    paddedOutput.push(0);
  }

  // Generate hash of output data with model secret and ID
  const outputDataBigInt = paddedOutput.map(x => BigInt(x));
  const hashInputs = [...outputDataBigInt, modelSecret, BigInt(modelId)];
  const outputHash = await generatePoseidonHash(hashInputs);

  // Prepare circuit inputs
  const input = {
    outputHash: outputHash.toString(),
    minValue: minValue.toString(),
    maxValue: maxValue.toString(),
    modelId: modelId.toString(),
    outputData: paddedOutput.map(x => x.toString()),
    modelSecret: modelSecret.toString(),
  };

  // Save input to file for debugging
  const inputFile = path.join(OUTPUT_DIR, "output_verifier_input.json");
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(inputFile, JSON.stringify(input, null, 2));

  // Generate witness
  const wasmFile = path.join(KEYS_DIR, "output_verifier", "output_verifier_js", "output_verifier.wasm");
  const zkeyFile = path.join(KEYS_DIR, "output_verifier", "output_verifier_0001.zkey");

  if (!fs.existsSync(wasmFile)) {
    throw new Error(
      `WASM file not found: ${wasmFile}\nPlease run 'yarn zk:compile' first.`,
    );
  }

  if (!fs.existsSync(zkeyFile)) {
    throw new Error(
      `Proving key not found: ${zkeyFile}\nPlease run 'yarn zk:compile' first.`,
    );
  }

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    wasmFile,
    zkeyFile,
  );

  console.log("✓ Output proof generated successfully");
  return { proof, publicSignals };
}

/**
 * Verify an input proof locally (off-chain)
 */
export async function verifyInputProof(
  proof: any,
  publicSignals: any,
): Promise<boolean> {
  console.log("Verifying input proof locally...");

  const vkeyFile = path.join(KEYS_DIR, "input_verifier", "verification_key.json");

  if (!fs.existsSync(vkeyFile)) {
    throw new Error(
      `Verification key not found: ${vkeyFile}\nPlease run 'yarn zk:compile' first.`,
    );
  }

  const vkey = JSON.parse(fs.readFileSync(vkeyFile, "utf-8"));
  const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  console.log(`✓ Input proof verification: ${verified ? "VALID" : "INVALID"}`);
  return verified;
}

/**
 * Verify an output proof locally (off-chain)
 */
export async function verifyOutputProof(
  proof: any,
  publicSignals: any,
): Promise<boolean> {
  console.log("Verifying output proof locally...");

  const vkeyFile = path.join(KEYS_DIR, "output_verifier", "verification_key.json");

  if (!fs.existsSync(vkeyFile)) {
    throw new Error(
      `Verification key not found: ${vkeyFile}\nPlease run 'yarn zk:compile' first.`,
    );
  }

  const vkey = JSON.parse(fs.readFileSync(vkeyFile, "utf-8"));
  const verified = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  console.log(`✓ Output proof verification: ${verified ? "VALID" : "INVALID"}`);
  return verified;
}

/**
 * Convert proof to format for Solidity verifier
 */
export function formatProofForSolidity(proof: any, publicSignals: any): {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
  input: string[];
} {
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
    input: publicSignals,
  };
}

/**
 * Save proof to file
 */
export function saveProof(
  circuitName: string,
  proof: any,
  publicSignals: any,
  filename?: string,
): string {
  const outputDir = circuitName.includes("input") ? INPUT_DIR : OUTPUT_DIR;
  const filepath = path.join(
    outputDir,
    filename || `${circuitName}_proof.json`,
  );

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    filepath,
    JSON.stringify({ proof, publicSignals }, null, 2),
  );

  console.log(`✓ Proof saved to: ${filepath}`);
  return filepath;
}

/**
 * Load proof from file
 */
export function loadProof(filepath: string): { proof: any; publicSignals: any } {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Proof file not found: ${filepath}`);
  }

  const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  return { proof: data.proof, publicSignals: data.publicSignals };
}


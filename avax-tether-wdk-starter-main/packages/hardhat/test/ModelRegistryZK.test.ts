import { expect } from "chai";
import { ethers } from "hardhat";
import { ModelRegistryZK } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ModelRegistryZK", function () {
  let modelRegistryZK: ModelRegistryZK;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let modelOwner: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2, modelOwner] = await ethers.getSigners();

    // Deploy ModelRegistryZK
    const ModelRegistryZKFactory = await ethers.getContractFactory("ModelRegistryZK");
    modelRegistryZK = await ModelRegistryZKFactory.deploy();
    await modelRegistryZK.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await modelRegistryZK.owner()).to.equal(owner.address);
    });

    it("Should enable ZK verification by default", async function () {
      expect(await modelRegistryZK.zkVerificationEnabled()).to.equal(true);
    });
  });

  describe("Model Registration", function () {
    it("Should register a model", async function () {
      const dockerUrl = "docker.io/mymodel:latest";
      
      await expect(modelRegistryZK.connect(modelOwner).registerModel(dockerUrl))
        .to.emit(modelRegistryZK, "ModelRegistered")
        .withArgs(0, modelOwner.address, dockerUrl, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      const modelInfo = await modelRegistryZK.getModelInfo(0);
      expect(modelInfo.owner).to.equal(modelOwner.address);
      expect(modelInfo.dockerImageUrl).to.equal(dockerUrl);
    });

    it("Should set model secret", async function () {
      await modelRegistryZK.connect(modelOwner).registerModel("docker.io/model:v1");
      
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes("my-secret"));
      await modelRegistryZK.connect(modelOwner).setModelSecret(0, secretHash);

      expect(await modelRegistryZK.getModelSecretHash(0)).to.equal(secretHash);
    });

    it("Should fail if non-owner tries to set model secret", async function () {
      await modelRegistryZK.connect(modelOwner).registerModel("docker.io/model:v1");
      
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes("my-secret"));
      await expect(
        modelRegistryZK.connect(user1).setModelSecret(0, secretHash)
      ).to.be.revertedWithCustomError(modelRegistryZK, "OnlyModelOwner");
    });
  });

  describe("Verifier Management", function () {
    it("Should allow owner to set input verifier", async function () {
      const mockVerifier = await (await ethers.getContractFactory("MockVerifier")).deploy();
      await mockVerifier.waitForDeployment();

      await expect(modelRegistryZK.setInputVerifier(await mockVerifier.getAddress()))
        .to.emit(modelRegistryZK, "VerifierUpdated")
        .withArgs(await mockVerifier.getAddress(), true, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await modelRegistryZK.inputVerifier()).to.equal(await mockVerifier.getAddress());
    });

    it("Should allow owner to set output verifier", async function () {
      const mockVerifier = await (await ethers.getContractFactory("MockVerifier")).deploy();
      await mockVerifier.waitForDeployment();

      await expect(modelRegistryZK.setOutputVerifier(await mockVerifier.getAddress()))
        .to.emit(modelRegistryZK, "VerifierUpdated")
        .withArgs(await mockVerifier.getAddress(), false, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await modelRegistryZK.outputVerifier()).to.equal(await mockVerifier.getAddress());
    });

    it("Should allow owner to toggle ZK verification", async function () {
      await expect(modelRegistryZK.toggleZKVerification(false))
        .to.emit(modelRegistryZK, "ZKVerificationToggled")
        .withArgs(false, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await modelRegistryZK.zkVerificationEnabled()).to.equal(false);

      await modelRegistryZK.toggleZKVerification(true);
      expect(await modelRegistryZK.zkVerificationEnabled()).to.equal(true);
    });
  });

  describe("Input Verification", function () {
    it("Should verify input when ZK is disabled", async function () {
      await modelRegistryZK.toggleZKVerification(false);

      const mockProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8],
        publicSignals: [
          ethers.toBigInt(ethers.keccak256(ethers.toUtf8Bytes("input"))),
          10,
          100
        ]
      };

      const tx = await modelRegistryZK.verifyInput(mockProof);
      const receipt = await tx.wait();
      
      expect(receipt).to.not.be.null;
    });

    it("Should revert if verifier not set when ZK is enabled", async function () {
      const mockProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8],
        publicSignals: [
          ethers.toBigInt(ethers.keccak256(ethers.toUtf8Bytes("input"))),
          10,
          100
        ]
      };

      await expect(
        modelRegistryZK.verifyInput(mockProof)
      ).to.be.revertedWithCustomError(modelRegistryZK, "VerifierNotSet");
    });

    it("Should track verified inputs", async function () {
      await modelRegistryZK.toggleZKVerification(false);

      const inputHash = ethers.keccak256(ethers.toUtf8Bytes("test-input"));
      const mockProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8],
        publicSignals: [ethers.toBigInt(inputHash), 10, 100]
      };

      await modelRegistryZK.verifyInput(mockProof);
      expect(await modelRegistryZK.isInputVerified(inputHash)).to.equal(true);
    });
  });

  describe("Output Verification", function () {
    beforeEach(async function () {
      await modelRegistryZK.connect(modelOwner).registerModel("docker.io/model:v1");
    });

    it("Should verify output when ZK is disabled", async function () {
      await modelRegistryZK.toggleZKVerification(false);

      const mockProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8],
        publicSignals: [
          ethers.toBigInt(ethers.keccak256(ethers.toUtf8Bytes("output"))),
          0,
          1000,
          0 // modelId
        ]
      };

      await expect(modelRegistryZK.verifyOutput(0, mockProof))
        .to.emit(modelRegistryZK, "OutputVerified");
    });

    it("Should track verified outputs", async function () {
      await modelRegistryZK.toggleZKVerification(false);

      const outputHash = ethers.keccak256(ethers.toUtf8Bytes("test-output"));
      const mockProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8],
        publicSignals: [ethers.toBigInt(outputHash), 0, 1000, 0]
      };

      await modelRegistryZK.verifyOutput(0, mockProof);
      expect(await modelRegistryZK.isOutputVerified(outputHash)).to.equal(true);
    });
  });

  describe("Model Execution with ZK", function () {
    beforeEach(async function () {
      await modelRegistryZK.connect(modelOwner).registerModel("docker.io/model:v1");
      await modelRegistryZK.toggleZKVerification(false);
    });

    it("Should execute model with verified input", async function () {
      const inputHash = ethers.keccak256(ethers.toUtf8Bytes("test-input"));
      const mockProof = {
        a: [1, 2],
        b: [[3, 4], [5, 6]],
        c: [7, 8],
        publicSignals: [ethers.toBigInt(inputHash), 10, 100]
      };

      await modelRegistryZK.verifyInput(mockProof);
      
      await expect(modelRegistryZK.executeModelWithZK(0, inputHash))
        .to.emit(modelRegistryZK, "ModelSelected");
    });

    it("Should fail to execute with unverified input when ZK enabled", async function () {
      await modelRegistryZK.toggleZKVerification(true);
      
      const inputHash = ethers.keccak256(ethers.toUtf8Bytes("unverified-input"));
      
      await expect(
        modelRegistryZK.executeModelWithZK(0, inputHash)
      ).to.be.revertedWithCustomError(modelRegistryZK, "InputNotVerified");
    });
  });
});

// Mock Verifier contract for testing
// Note: This should be in a separate file in production
const MockVerifierSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockVerifier {
    bool public shouldVerify = true;

    function setShouldVerify(bool _shouldVerify) external {
        shouldVerify = _shouldVerify;
    }

    function verifyProof(
        uint256[2] calldata,
        uint256[2][2] calldata,
        uint256[2] calldata,
        uint256[] calldata
    ) external view returns (bool) {
        return shouldVerify;
    }
}
`;


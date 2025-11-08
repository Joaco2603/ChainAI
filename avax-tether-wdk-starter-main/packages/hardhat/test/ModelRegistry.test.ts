import { expect } from "chai";
import { ethers } from "hardhat";
import { ModelRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ModelRegistry", function () {
  let modelRegistry: ModelRegistry;
  let owner: SignerWithAddress;
  let developer1: SignerWithAddress;
  let developer2: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  const DOCKER_URL_1 = "docker.io/chainai/sentiment-analysis:v1.0.0";
  const DOCKER_URL_2 = "docker.io/chainai/text-generation:v2.1.0";
  const DOCKER_URL_3 = "docker.io/chainai/image-classification:v1.5.0";

  beforeEach(async function () {
    // Get signers
    [owner, developer1, developer2, user1, user2, user3] = await ethers.getSigners();

    // Deploy contract
    const ModelRegistryFactory = await ethers.getContractFactory("ModelRegistry");
    modelRegistry = (await ModelRegistryFactory.deploy()) as ModelRegistry;
    await modelRegistry.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await modelRegistry.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero models", async function () {
      expect(await modelRegistry.totalModels()).to.equal(0);
    });

    it("Should have correct constants", async function () {
      expect(await modelRegistry.MIN_RATING()).to.equal(1);
      expect(await modelRegistry.MAX_RATING()).to.equal(5);
      expect(await modelRegistry.TOP_MODEL_PROBABILITY()).to.equal(70);
    });
  });

  describe("Model Registration", function () {
    it("Should register a new model", async function () {
      const tx = await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
      await tx.wait();

      expect(await modelRegistry.totalModels()).to.equal(1);
    });

    it("Should emit ModelRegistered event with correct parameters", async function () {
      await expect(modelRegistry.connect(developer1).registerModel(DOCKER_URL_1))
        .to.emit(modelRegistry, "ModelRegistered")
        .withArgs(0, developer1.address, DOCKER_URL_1, await ethers.provider.getBlock("latest").then(b => b?.timestamp));
    });

    it("Should store model information correctly", async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);

      const modelInfo = await modelRegistry.getModelInfo(0);
      expect(modelInfo.owner).to.equal(developer1.address);
      expect(modelInfo.dockerImageUrl).to.equal(DOCKER_URL_1);
      expect(modelInfo.averageRating).to.equal(0);
      expect(modelInfo.ratingCount).to.equal(0);
      expect(modelInfo.timesSelected).to.equal(0);
      expect(modelInfo.isActive).to.equal(true);
    });

    it("Should allow multiple models to be registered", async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
      await modelRegistry.connect(developer2).registerModel(DOCKER_URL_2);
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_3);

      expect(await modelRegistry.totalModels()).to.equal(3);
    });

    it("Should revert when registering with empty URL", async function () {
      await expect(modelRegistry.connect(developer1).registerModel("")).to.be.revertedWithCustomError(
        modelRegistry,
        "EmptyDockerUrl",
      );
    });

    it("Should assign sequential model IDs", async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
      await modelRegistry.connect(developer2).registerModel(DOCKER_URL_2);

      const model0 = await modelRegistry.getModelInfo(0);
      const model1 = await modelRegistry.getModelInfo(1);

      expect(model0.dockerImageUrl).to.equal(DOCKER_URL_1);
      expect(model1.dockerImageUrl).to.equal(DOCKER_URL_2);
    });
  });

  describe("Model Rating", function () {
    beforeEach(async function () {
      // Register a model before each test
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
    });

    it("Should allow users to rate a model", async function () {
      await modelRegistry.connect(user1).rateModel(0, 5);

      const modelInfo = await modelRegistry.getModelInfo(0);
      expect(modelInfo.ratingCount).to.equal(1);
      expect(modelInfo.averageRating).to.equal(500); // 5 * 100
    });

    it("Should emit ModelRated event", async function () {
      await expect(modelRegistry.connect(user1).rateModel(0, 4))
        .to.emit(modelRegistry, "ModelRated")
        .withArgs(0, user1.address, 4, 400);
    });

    it("Should calculate average rating correctly", async function () {
      await modelRegistry.connect(user1).rateModel(0, 5);
      await modelRegistry.connect(user2).rateModel(0, 3);
      await modelRegistry.connect(user3).rateModel(0, 4);

      const modelInfo = await modelRegistry.getModelInfo(0);
      // (5 + 3 + 4) / 3 = 4 average, * 100 = 400
      expect(modelInfo.averageRating).to.equal(400);
      expect(modelInfo.ratingCount).to.equal(3);
    });

    it("Should prevent rating below minimum", async function () {
      await expect(modelRegistry.connect(user1).rateModel(0, 0)).to.be.revertedWithCustomError(
        modelRegistry,
        "InvalidRating",
      );
    });

    it("Should prevent rating above maximum", async function () {
      await expect(modelRegistry.connect(user1).rateModel(0, 6)).to.be.revertedWithCustomError(
        modelRegistry,
        "InvalidRating",
      );
    });

    it("Should prevent double rating by same user", async function () {
      await modelRegistry.connect(user1).rateModel(0, 5);

      await expect(modelRegistry.connect(user1).rateModel(0, 4)).to.be.revertedWithCustomError(
        modelRegistry,
        "AlreadyRated",
      );
    });

    it("Should prevent rating non-existent model", async function () {
      await expect(modelRegistry.connect(user1).rateModel(999, 5)).to.be.revertedWithCustomError(
        modelRegistry,
        "ModelNotFound",
      );
    });

    it("Should track user ratings correctly", async function () {
      await modelRegistry.connect(user1).rateModel(0, 5);

      expect(await modelRegistry.hasUserRated(0, user1.address)).to.equal(true);
      expect(await modelRegistry.hasUserRated(0, user2.address)).to.equal(false);
    });

    it("Should prevent rating inactive models", async function () {
      await modelRegistry.connect(developer1).deactivateModel(0);

      await expect(modelRegistry.connect(user1).rateModel(0, 5)).to.be.revertedWithCustomError(
        modelRegistry,
        "ModelInactive",
      );
    });
  });

  describe("Top Models", function () {
    beforeEach(async function () {
      // Register multiple models
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
      await modelRegistry.connect(developer2).registerModel(DOCKER_URL_2);
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_3);

      // Rate them differently
      // Model 0: average 4.0
      await modelRegistry.connect(user1).rateModel(0, 4);
      await modelRegistry.connect(user2).rateModel(0, 4);

      // Model 1: average 5.0
      await modelRegistry.connect(user1).rateModel(1, 5);
      await modelRegistry.connect(user2).rateModel(1, 5);

      // Model 2: average 3.0
      await modelRegistry.connect(user1).rateModel(2, 3);
    });

    it("Should return top models sorted by rating", async function () {
      const [topModelIds] = await modelRegistry.getTopModels(3);

      expect(topModelIds.length).to.equal(3);
      expect(topModelIds[0]).to.equal(1); // Model 1 has highest rating
      expect(topModelIds[1]).to.equal(0); // Model 0 has second highest
      expect(topModelIds[2]).to.equal(2); // Model 2 has lowest
    });

    it("Should limit results correctly", async function () {
      const [topModelIds] = await modelRegistry.getTopModels(2);

      expect(topModelIds.length).to.equal(2);
      expect(topModelIds[0]).to.equal(1);
      expect(topModelIds[1]).to.equal(0);
    });

    it("Should handle request for more models than exist", async function () {
      const [topModelIds] = await modelRegistry.getTopModels(10);

      expect(topModelIds.length).to.equal(3); // Only 3 models exist
    });

    it("Should return empty array when no active models", async function () {
      await modelRegistry.connect(developer1).deactivateModel(0);
      await modelRegistry.connect(developer2).deactivateModel(1);
      await modelRegistry.connect(developer1).deactivateModel(2);

      const [topModelIds] = await modelRegistry.getTopModels(3);
      expect(topModelIds.length).to.equal(0);
    });

    it("Should only include active models", async function () {
      await modelRegistry.connect(developer2).deactivateModel(1);

      const [topModelIds] = await modelRegistry.getTopModels(3);
      expect(topModelIds.length).to.equal(2);
      expect(topModelIds).to.not.include(1);
    });
  });

  describe("Model Selection", function () {
    beforeEach(async function () {
      // Register and rate models
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
      await modelRegistry.connect(developer2).registerModel(DOCKER_URL_2);

      // Make model 0 clearly the best
      await modelRegistry.connect(user1).rateModel(0, 5);
      await modelRegistry.connect(user2).rateModel(0, 5);
      await modelRegistry.connect(user3).rateModel(0, 5);

      // Model 1 has lower rating
      await modelRegistry.connect(user1).rateModel(1, 3);
    });

    it("Should select a model and increment counter", async function () {
      await modelRegistry.connect(user1).selectModel();

      const modelInfo0 = await modelRegistry.getModelInfo(0);
      const modelInfo1 = await modelRegistry.getModelInfo(1);

      expect(modelInfo0.timesSelected + modelInfo1.timesSelected).to.equal(1);
    });

    it("Should emit ModelSelected event", async function () {
      await expect(modelRegistry.connect(user1).selectModel()).to.emit(modelRegistry, "ModelSelected");
    });

    it("Should favor top-rated model statistically", async function () {
      const iterations = 100;
      let topModelSelected = 0;

      for (let i = 0; i < iterations; i++) {
        const tx = await modelRegistry.connect(user1).selectModel();
        const receipt = await tx.wait();

        // Parse the event to get selected model
        const event = receipt?.logs.find((log: any) => {
          try {
            const parsed = modelRegistry.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });
            return parsed?.name === "ModelSelected";
          } catch {
            return false;
          }
        });

        if (event) {
          const parsedLog = modelRegistry.interface.parseLog({
            topics: [...event.topics],
            data: event.data,
          });

          if (parsedLog?.args[0] === 0n) {
            topModelSelected++;
          }
        }
      }

      // Top model should be selected more than 50% of the time
      // (70% probability minus some variance)
      expect(topModelSelected).to.be.greaterThan(50);
    });

    it("Should revert when no active models", async function () {
      await modelRegistry.connect(developer1).deactivateModel(0);
      await modelRegistry.connect(developer2).deactivateModel(1);

      await expect(modelRegistry.connect(user1).selectModel()).to.be.revertedWithCustomError(
        modelRegistry,
        "NoActiveModels",
      );
    });
  });

  describe("Model Activation/Deactivation", function () {
    beforeEach(async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
    });

    it("Should allow owner to deactivate model", async function () {
      await modelRegistry.connect(developer1).deactivateModel(0);

      const modelInfo = await modelRegistry.getModelInfo(0);
      expect(modelInfo.isActive).to.equal(false);
    });

    it("Should emit ModelDeactivated event", async function () {
      await expect(modelRegistry.connect(developer1).deactivateModel(0)).to.emit(modelRegistry, "ModelDeactivated");
    });

    it("Should allow contract owner to deactivate any model", async function () {
      await modelRegistry.connect(owner).deactivateModel(0);

      const modelInfo = await modelRegistry.getModelInfo(0);
      expect(modelInfo.isActive).to.equal(false);
    });

    it("Should prevent non-owner from deactivating model", async function () {
      await expect(modelRegistry.connect(user1).deactivateModel(0)).to.be.revertedWithCustomError(
        modelRegistry,
        "OnlyModelOwner",
      );
    });

    it("Should allow reactivating a model", async function () {
      await modelRegistry.connect(developer1).deactivateModel(0);
      await modelRegistry.connect(developer1).reactivateModel(0);

      const modelInfo = await modelRegistry.getModelInfo(0);
      expect(modelInfo.isActive).to.equal(true);
    });

    it("Should emit ModelReactivated event", async function () {
      await modelRegistry.connect(developer1).deactivateModel(0);

      await expect(modelRegistry.connect(developer1).reactivateModel(0)).to.emit(modelRegistry, "ModelReactivated");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_2);
      await modelRegistry.connect(developer2).registerModel(DOCKER_URL_3);
    });

    it("Should get models by owner", async function () {
      const dev1Models = await modelRegistry.getModelsByOwner(developer1.address);
      const dev2Models = await modelRegistry.getModelsByOwner(developer2.address);

      expect(dev1Models.length).to.equal(2);
      expect(dev2Models.length).to.equal(1);
      expect(dev1Models[0]).to.equal(0);
      expect(dev1Models[1]).to.equal(1);
      expect(dev2Models[0]).to.equal(2);
    });

    it("Should return empty array for owner with no models", async function () {
      const models = await modelRegistry.getModelsByOwner(user1.address);
      expect(models.length).to.equal(0);
    });

    it("Should get complete model info", async function () {
      await modelRegistry.connect(user1).rateModel(0, 5);
      await modelRegistry.connect(user2).rateModel(0, 3);

      const info = await modelRegistry.getModelInfo(0);

      expect(info.owner).to.equal(developer1.address);
      expect(info.dockerImageUrl).to.equal(DOCKER_URL_1);
      expect(info.averageRating).to.equal(400); // (5+3)/2 * 100
      expect(info.ratingCount).to.equal(2);
      expect(info.isActive).to.equal(true);
    });

    it("Should check if user has rated", async function () {
      await modelRegistry.connect(user1).rateModel(0, 5);

      expect(await modelRegistry.hasUserRated(0, user1.address)).to.equal(true);
      expect(await modelRegistry.hasUserRated(0, user2.address)).to.equal(false);
      expect(await modelRegistry.hasUserRated(1, user1.address)).to.equal(false);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle model with no ratings in getTopModels", async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
      await modelRegistry.connect(developer2).registerModel(DOCKER_URL_2);

      await modelRegistry.connect(user1).rateModel(0, 5);
      // Model 1 has no ratings

      const [topModels] = await modelRegistry.getTopModels(2);
      expect(topModels.length).to.equal(2);
      expect(topModels[0]).to.equal(0); // Rated model should be first
    });

    it("Should handle single model scenario", async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);
      await modelRegistry.connect(user1).rateModel(0, 5);

      const tx = await modelRegistry.connect(user1).selectModel();
      expect(tx).to.not.be.undefined;
    });

    it("Should handle maximum rating values", async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);

      // Multiple users giving max rating
      await modelRegistry.connect(user1).rateModel(0, 5);
      await modelRegistry.connect(user2).rateModel(0, 5);
      await modelRegistry.connect(user3).rateModel(0, 5);

      const info = await modelRegistry.getModelInfo(0);
      expect(info.averageRating).to.equal(500);
    });

    it("Should handle minimum rating values", async function () {
      await modelRegistry.connect(developer1).registerModel(DOCKER_URL_1);

      await modelRegistry.connect(user1).rateModel(0, 1);
      await modelRegistry.connect(user2).rateModel(0, 1);

      const info = await modelRegistry.getModelInfo(0);
      expect(info.averageRating).to.equal(100);
    });
  });
});

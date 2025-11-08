// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.20;

import "./ModelRegistry.sol";

/**
 * @title IZKVerifier
 * @dev Interface for ZK proof verifier contracts
 */
interface IZKVerifier {
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[] calldata _pubSignals
    ) external view returns (bool);
}

/**
 * @title ModelRegistryZK
 * @dev Extended ModelRegistry with Zero-Knowledge proof verification for privacy
 * @notice This contract adds ZK proof verification for:
 *   1. Input validation (ensures user inputs are within valid ranges without revealing them)
 *   2. Output validation (ensures model outputs are correct without revealing computation)
 */
contract ModelRegistryZK is ModelRegistry {
    // ============ State Variables ============

    /// @dev Input verifier contract address
    IZKVerifier public inputVerifier;

    /// @dev Output verifier contract address
    IZKVerifier public outputVerifier;

    /// @dev Mapping to store input hashes for verification
    mapping(bytes32 => bool) public verifiedInputs;

    /// @dev Mapping to store output hashes for verification
    mapping(bytes32 => bool) public verifiedOutputs;

    /// @dev Mapping to track model secrets (modelId => secretHash)
    mapping(uint256 => bytes32) public modelSecrets;

    /// @dev Flag to enable/disable ZK verification
    bool public zkVerificationEnabled;

    // ============ Structs ============

    /**
     * @dev Structure for ZK proof data
     */
    struct ZKProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[] publicSignals;
    }

    // ============ Events ============

    event InputVerified(bytes32 indexed inputHash, address indexed user, uint256 timestamp);
    event OutputVerified(bytes32 indexed outputHash, uint256 indexed modelId, uint256 timestamp);
    event ZKVerificationToggled(bool enabled, uint256 timestamp);
    event VerifierUpdated(address indexed verifier, bool isInputVerifier, uint256 timestamp);

    // ============ Errors ============

    error InvalidProof();
    error ZKVerificationRequired();
    error VerifierNotSet();
    error InputNotVerified();
    error InvalidPublicSignals();

    // ============ Constructor ============

    constructor() ModelRegistry() {
        zkVerificationEnabled = true;
    }

    // ============ Admin Functions ============

    /**
     * @notice Set the input verifier contract
     * @param _verifier Address of the input verifier contract
     */
    function setInputVerifier(address _verifier) external onlyOwner {
        inputVerifier = IZKVerifier(_verifier);
        emit VerifierUpdated(_verifier, true, block.timestamp);
    }

    /**
     * @notice Set the output verifier contract
     * @param _verifier Address of the output verifier contract
     */
    function setOutputVerifier(address _verifier) external onlyOwner {
        outputVerifier = IZKVerifier(_verifier);
        emit VerifierUpdated(_verifier, false, block.timestamp);
    }

    /**
     * @notice Toggle ZK verification on/off
     * @param _enabled Whether to enable ZK verification
     */
    function toggleZKVerification(bool _enabled) external onlyOwner {
        zkVerificationEnabled = _enabled;
        emit ZKVerificationToggled(_enabled, block.timestamp);
    }

    /**
     * @notice Set model secret hash (only model owner)
     * @param modelId The model ID
     * @param secretHash Hash of the model's secret
     */
    function setModelSecret(uint256 modelId, bytes32 secretHash) external {
        if (modelId >= totalModels) {
            revert ModelNotFound();
        }
        
        Model storage model = models[modelId];
        
        if (msg.sender != model.owner) {
            revert OnlyModelOwner();
        }

        modelSecrets[modelId] = secretHash;
    }

    // ============ ZK Verification Functions ============

    /**
     * @notice Verify input data with ZK proof
     * @param proof ZK proof data
     * @return inputHash The hash of verified input
     */
    function verifyInput(ZKProof calldata proof) 
        external 
        returns (bytes32 inputHash) 
    {
        if (zkVerificationEnabled) {
            if (address(inputVerifier) == address(0)) {
                revert VerifierNotSet();
            }

            // Verify the proof
            bool valid = inputVerifier.verifyProof(
                proof.a,
                proof.b,
                proof.c,
                proof.publicSignals
            );

            if (!valid) {
                revert InvalidProof();
            }
        }

        // Extract input hash from public signals (first element)
        if (proof.publicSignals.length < 3) {
            revert InvalidPublicSignals();
        }

        inputHash = bytes32(proof.publicSignals[0]);
        verifiedInputs[inputHash] = true;

        emit InputVerified(inputHash, msg.sender, block.timestamp);
        return inputHash;
    }

    /**
     * @notice Verify output data with ZK proof
     * @param modelId The model that generated the output
     * @param proof ZK proof data
     * @return outputHash The hash of verified output
     */
    function verifyOutput(uint256 modelId, ZKProof calldata proof) 
        external 
        returns (bytes32 outputHash) 
    {
        if (modelId >= totalModels) {
            revert ModelNotFound();
        }

        if (zkVerificationEnabled) {
            if (address(outputVerifier) == address(0)) {
                revert VerifierNotSet();
            }

            // Verify the proof
            bool valid = outputVerifier.verifyProof(
                proof.a,
                proof.b,
                proof.c,
                proof.publicSignals
            );

            if (!valid) {
                revert InvalidProof();
            }

            // Verify model ID matches
            if (proof.publicSignals.length < 4) {
                revert InvalidPublicSignals();
            }
            
            if (proof.publicSignals[3] != modelId) {
                revert InvalidPublicSignals();
            }
        }

        // Extract output hash from public signals
        outputHash = bytes32(proof.publicSignals[0]);
        verifiedOutputs[outputHash] = true;

        emit OutputVerified(outputHash, modelId, block.timestamp);
        return outputHash;
    }

    /**
     * @notice Execute model with verified input (ZK-enabled version)
     * @param modelId The model to execute
     * @param inputHash Hash of the verified input
     * @return success Whether execution was successful
     */
    function executeModelWithZK(uint256 modelId, bytes32 inputHash) 
        external 
        returns (bool success) 
    {
        if (modelId >= totalModels) {
            revert ModelNotFound();
        }

        if (zkVerificationEnabled && !verifiedInputs[inputHash]) {
            revert InputNotVerified();
        }

        Model storage model = models[modelId];
        
        if (!model.isActive) {
            revert ModelInactive();
        }

        // Increment times selected
        model.timesSelected++;

        emit ModelSelected(modelId, model.owner, false, block.timestamp);

        return true;
    }

    /**
     * @notice Check if an input hash has been verified
     * @param inputHash The input hash to check
     * @return Whether the input has been verified
     */
    function isInputVerified(bytes32 inputHash) external view returns (bool) {
        return verifiedInputs[inputHash];
    }

    /**
     * @notice Check if an output hash has been verified
     * @param outputHash The output hash to check
     * @return Whether the output has been verified
     */
    function isOutputVerified(bytes32 outputHash) external view returns (bool) {
        return verifiedOutputs[outputHash];
    }

    /**
     * @notice Get model secret hash
     * @param modelId The model ID
     * @return The model's secret hash
     */
    function getModelSecretHash(uint256 modelId) external view returns (bytes32) {
        if (modelId >= totalModels) {
            revert ModelNotFound();
        }
        return modelSecrets[modelId];
    }

    // ============ Batch Verification ============

    /**
     * @notice Verify multiple inputs in a single transaction
     * @param proofs Array of ZK proofs
     * @return inputHashes Array of verified input hashes
     */
    function verifyInputBatch(ZKProof[] calldata proofs) 
        external 
        returns (bytes32[] memory inputHashes) 
    {
        inputHashes = new bytes32[](proofs.length);
        
        for (uint256 i = 0; i < proofs.length; i++) {
            if (zkVerificationEnabled) {
                if (address(inputVerifier) == address(0)) {
                    revert VerifierNotSet();
                }

                bool valid = inputVerifier.verifyProof(
                    proofs[i].a,
                    proofs[i].b,
                    proofs[i].c,
                    proofs[i].publicSignals
                );

                if (!valid) {
                    revert InvalidProof();
                }
            }

            if (proofs[i].publicSignals.length < 3) {
                revert InvalidPublicSignals();
            }

            bytes32 inputHash = bytes32(proofs[i].publicSignals[0]);
            verifiedInputs[inputHash] = true;
            inputHashes[i] = inputHash;

            emit InputVerified(inputHash, msg.sender, block.timestamp);
        }

        return inputHashes;
    }
}


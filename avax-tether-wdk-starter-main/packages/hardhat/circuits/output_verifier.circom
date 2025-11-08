pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * @title OutputRangeCheck
 * @dev Helper template to verify output value is within specified range
 */
template OutputRangeCheck() {
    signal input value;
    signal input minValue;
    signal input maxValue;
    signal output valid;
    
    // Check value >= minValue
    component gte = GreaterEqThan(252);
    gte.in[0] <== value;
    gte.in[1] <== minValue;
    
    // Check value <= maxValue  
    component lte = LessEqThan(252);
    lte.in[0] <== value;
    lte.in[1] <== maxValue;
    
    // Both conditions must be true
    valid <== gte.out * lte.out;
}

/**
 * @title OutputVerifier
 * @dev Verifies that AI model output is within acceptable range and format
 * @notice This circuit ensures:
 *   1. Output values are within specified bounds
 *   2. Output format is valid
 *   3. Output integrity is maintained
 */
template OutputVerifier(outputSize) {
    // Public inputs
    signal input outputHash;       // Hash of the output (public for verification)
    signal input minValue;         // Minimum allowed output value (public)
    signal input maxValue;         // Maximum allowed output value (public)
    signal input modelId;          // Model ID that generated this output (public)
    
    // Private inputs (witness)
    signal input outputData[outputSize];     // Actual output values (private)
    signal input modelSecret;                // Secret known only to the model (private)
    
    // Output
    signal output valid;
    
    // Components
    component hasher = Poseidon(outputSize + 2);
    component rangeCheckers[outputSize];
    
    // 1. Verify the hash of output data includes modelSecret and modelId
    for (var i = 0; i < outputSize; i++) {
        hasher.inputs[i] <== outputData[i];
    }
    hasher.inputs[outputSize] <== modelSecret;
    hasher.inputs[outputSize + 1] <== modelId;
    
    // Hash must match the public hash
    outputHash === hasher.out;
    
    // 2. Verify each output value is within the allowed range
    for (var i = 0; i < outputSize; i++) {
        rangeCheckers[i] = OutputRangeCheck();
        rangeCheckers[i].value <== outputData[i];
        rangeCheckers[i].minValue <== minValue;
        rangeCheckers[i].maxValue <== maxValue;
    }
    
    // Output is valid if hash matches and all range checks pass
    valid <== 1;
}

// Main component with outputSize = 10 (can be adjusted)
component main {public [outputHash, minValue, maxValue, modelId]} = OutputVerifier(10);


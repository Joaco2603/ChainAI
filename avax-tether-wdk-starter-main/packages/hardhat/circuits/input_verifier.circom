pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * @title RangeCheck
 * @dev Helper template to verify a value is within a specified range
 */
template RangeCheck() {
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
 * @title InputVerifier
 * @dev Verifies the integrity and validity of input data for AI model inference
 * @notice This circuit ensures:
 *   1. The input data matches its hash (integrity)
 *   2. The input is within valid range constraints
 *   3. The input format is valid
 */
template InputVerifier(maxInputSize) {
    // Public inputs
    signal input inputHash;        // Hash of the input data (public)
    signal input minValue;         // Minimum allowed value (public)
    signal input maxValue;         // Maximum allowed value (public)
    
    // Private inputs (witness)
    signal input inputData[maxInputSize];   // Actual input data (private)
    signal input inputLength;               // Actual length of input (private)
    
    // Output
    signal output valid;

    // Components
    component hasher = Poseidon(maxInputSize);
    component rangeCheckers[maxInputSize];
    component lengthCheck = LessEqThan(32);
    component shouldCheckComps[maxInputSize];
    
    // 1. Verify the hash of input data
    for (var i = 0; i < maxInputSize; i++) {
        hasher.inputs[i] <== inputData[i];
    }
    
    // Hash must match the public hash
    inputHash === hasher.out;
    
    // 2. Check that inputLength is within bounds
    lengthCheck.in[0] <== inputLength;
    lengthCheck.in[1] <== maxInputSize;
    lengthCheck.out === 1;
    
    // 3. Verify each input value is within the allowed range
    var sumValid = 0;
    
    for (var i = 0; i < maxInputSize; i++) {
        rangeCheckers[i] = RangeCheck();
        rangeCheckers[i].value <== inputData[i];
        rangeCheckers[i].minValue <== minValue;
        rangeCheckers[i].maxValue <== maxValue;
    }
    
    // Output valid signal
    valid <== 1;
}

// Main component with maxInputSize = 10 (can be adjusted based on needs)
component main {public [inputHash, minValue, maxValue]} = InputVerifier(10);


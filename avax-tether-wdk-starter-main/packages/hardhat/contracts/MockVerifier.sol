// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockVerifier
 * @dev Mock ZK verifier for testing purposes
 * @notice This contract simulates a ZK verifier without actual proof verification
 *         Use only for development and testing - DO NOT USE IN PRODUCTION
 */
contract MockVerifier {
    bool public shouldVerify = true;

    /**
     * @notice Set whether proofs should verify
     * @param _shouldVerify True to accept all proofs, false to reject all
     */
    function setShouldVerify(bool _shouldVerify) external {
        shouldVerify = _shouldVerify;
    }

    /**
     * @notice Mock proof verification
     * @return Always returns shouldVerify value
     */
    function verifyProof(
        uint256[2] calldata, /* _pA */
        uint256[2][2] calldata, /* _pB */
        uint256[2] calldata, /* _pC */
        uint256[] calldata /* _pubSignals */
    ) external view returns (bool) {
        return shouldVerify;
    }
}


// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ModelRegistry
 * @dev Contract for registering and managing AI models on Avalanche
 * @notice This contract allows developers to register AI models, users to rate them,
 *         and implements a selection algorithm that favors top-rated models while
 *         maintaining diversity through randomization.
 */
contract ModelRegistry is Ownable, ReentrancyGuard {
    // ============ Structs ============

    /**
     * @dev Structure representing an AI model
     */
    struct Model {
        address owner;              // Developer who registered the model
        string dockerImageUrl;      // URL to the Docker image containing the model
        uint256 totalRating;        // Sum of all ratings received
        uint256 ratingCount;        // Number of ratings received
        uint256 timesSelected;      // Number of times this model was selected
        uint256 registrationTime;   // Timestamp when the model was registered
        bool isActive;              // Whether the model is active
    }

    // ============ State Variables ============

    /// @dev Array of all registered models
    Model[] public models;

    /// @dev Mapping to track if a user has rated a specific model
    /// modelId => user address => has rated
    mapping(uint256 => mapping(address => bool)) public hasRated;

    /// @dev Counter for total number of models registered
    uint256 public totalModels;

    /// @dev Minimum and maximum rating values
    uint8 public constant MIN_RATING = 1;
    uint8 public constant MAX_RATING = 5;

    /// @dev Percentage for top model selection (70%)
    uint256 public constant TOP_MODEL_PROBABILITY = 70;

    // Agregar variables de estado para pagos
    uint256 public registrationFee;     // Costo para registrar un modelo
    uint256 public usageFee;           // Costo para usar un modelo
    uint256 public platformFeePercent; // Porcentaje que se queda la plataforma (20% = 20)
    
    mapping(address => uint256) public pendingWithdrawals; // Balances pendientes de retiro

    // ============ Events ============

    /**
     * @dev Emitted when a new model is registered
     */
    event ModelRegistered(
        uint256 indexed modelId,
        address indexed owner,
        string dockerImageUrl,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a model is rated
     */
    event ModelRated(
        uint256 indexed modelId,
        address indexed rater,
        uint8 rating,
        uint256 newAverageRating
    );

    /**
     * @dev Emitted when a model is selected for execution
     */
    event ModelSelected(
        uint256 indexed modelId,
        address indexed owner,
        bool wasTopModel,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a model is deactivated
     */
    event ModelDeactivated(uint256 indexed modelId, uint256 timestamp);

    /**
     * @dev Emitted when a model is reactivated
     */
    event ModelReactivated(uint256 indexed modelId, uint256 timestamp);

    // Agregar eventos
    event FeeUpdated(string feeType, uint256 newAmount);
    event PaymentReceived(address indexed from, uint256 amount, string paymentType);
    event WithdrawalMade(address indexed to, uint256 amount);

    // ============ Errors ============

    error InvalidRating();
    error ModelNotFound();
    error AlreadyRated();
    error NoActiveModels();
    error ModelInactive();
    error OnlyModelOwner();
    error EmptyDockerUrl();
    error InsufficientPayment();
    error WithdrawalFailed();
    error NoFundsToWithdraw();

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {
        registrationFee = 0.1 ether;    // 0.1 AVAX para registrar
        usageFee = 0.01 ether;         // 0.01 AVAX para usar
        platformFeePercent = 20;        // 20% para la plataforma
    }

    // ============ External Functions ============

    /**
     * @notice Register a new AI model
     * @param dockerImageUrl URL to the Docker image containing the model
     * @return modelId The ID of the newly registered model
     */
    function registerModel(string calldata dockerImageUrl) 
        external 
        payable
        nonReentrant 
        returns (uint256 modelId) 
    {
        if (msg.value < registrationFee) {
            revert InsufficientPayment();
        }

        if (bytes(dockerImageUrl).length == 0) {
            revert EmptyDockerUrl();
        }

        modelId = totalModels;
        
        models.push(Model({
            owner: msg.sender,
            dockerImageUrl: dockerImageUrl,
            totalRating: 0,
            ratingCount: 0,
            timesSelected: 0,
            registrationTime: block.timestamp,
            isActive: true
        }));

        totalModels++;

        emit ModelRegistered(modelId, msg.sender, dockerImageUrl, block.timestamp);
        emit PaymentReceived(msg.sender, msg.value, "registration");
    }

    /**
     * @notice Rate a model
     * @param modelId The ID of the model to rate
     * @param rating The rating value (1-5)
     */
    function rateModel(uint256 modelId, uint8 rating) external nonReentrant {
        if (modelId >= totalModels) {
            revert ModelNotFound();
        }
        if (rating < MIN_RATING || rating > MAX_RATING) {
            revert InvalidRating();
        }
        if (hasRated[modelId][msg.sender]) {
            revert AlreadyRated();
        }
        if (!models[modelId].isActive) {
            revert ModelInactive();
        }

        Model storage model = models[modelId];
        model.totalRating += rating;
        model.ratingCount++;
        hasRated[modelId][msg.sender] = true;

        uint256 newAverage = (model.totalRating * 100) / model.ratingCount;

        emit ModelRated(modelId, msg.sender, rating, newAverage);
    }

    /**
     * @notice Get the top-rated models
     * @param limit Maximum number of models to return
     * @return topModelIds Array of model IDs sorted by rating (descending)
     * @return ratings Array of average ratings for each model
     */
    function getTopModels(uint256 limit) 
        external 
        view 
        returns (uint256[] memory topModelIds, uint256[] memory ratings) 
    {
        uint256 activeCount = _getActiveModelCount();
        if (activeCount == 0) {
            return (new uint256[](0), new uint256[](0));
        }

        uint256 resultSize = limit > activeCount ? activeCount : limit;
        topModelIds = new uint256[](resultSize);
        ratings = new uint256[](resultSize);

        // Create a temporary array with active models and their ratings
        uint256[] memory tempIds = new uint256[](activeCount);
        uint256[] memory tempRatings = new uint256[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < totalModels; i++) {
            if (models[i].isActive) {
                tempIds[index] = i;
                tempRatings[index] = _getWeightedRating(i);
                index++;
            }
        }

        // Simple bubble sort (suitable for small arrays)
        for (uint256 i = 0; i < activeCount - 1; i++) {
            for (uint256 j = 0; j < activeCount - i - 1; j++) {
                if (tempRatings[j] < tempRatings[j + 1]) {
                    // Swap ratings
                    (tempRatings[j], tempRatings[j + 1]) = (tempRatings[j + 1], tempRatings[j]);
                    // Swap ids
                    (tempIds[j], tempIds[j + 1]) = (tempIds[j + 1], tempIds[j]);
                }
            }
        }

        // Copy top results
        for (uint256 i = 0; i < resultSize; i++) {
            topModelIds[i] = tempIds[i];
            ratings[i] = tempRatings[i];
        }

        return (topModelIds, ratings);
    }

    /**
     * @notice Select a model for execution
     * @dev Uses weighted random selection: 70% chance for top model, 30% for others
     * @return modelId The ID of the selected model
     */
    function selectModel() 
        external 
        payable 
        nonReentrant 
        returns (uint256 modelId) 
    {
        if (msg.value < usageFee) {
            revert InsufficientPayment();
        }

        modelId = _selectModelInternal();

        // Distribuir el pago
        Model storage selectedModel = models[modelId];
        uint256 platformFee = (msg.value * platformFeePercent) / 100;
        uint256 modelOwnerFee = msg.value - platformFee;
        
        pendingWithdrawals[selectedModel.owner] += modelOwnerFee;
        pendingWithdrawals[owner()] += platformFee;

        selectedModel.timesSelected++;

        emit ModelSelected(modelId, selectedModel.owner, true, block.timestamp);
        emit PaymentReceived(msg.sender, msg.value, "usage");
        return modelId;
    }

    /**
     * @notice Deactivate a model (only owner or contract owner)
     * @param modelId The ID of the model to deactivate
     */
    function deactivateModel(uint256 modelId) external {
        if (modelId >= totalModels) {
            revert ModelNotFound();
        }
        
        Model storage model = models[modelId];
        
        if (msg.sender != model.owner && msg.sender != owner()) {
            revert OnlyModelOwner();
        }

        model.isActive = false;
        emit ModelDeactivated(modelId, block.timestamp);
    }

    /**
     * @notice Reactivate a model (only owner)
     * @param modelId The ID of the model to reactivate
     */
    function reactivateModel(uint256 modelId) external {
        if (modelId >= totalModels) {
            revert ModelNotFound();
        }
        
        Model storage model = models[modelId];
        
        if (msg.sender != model.owner && msg.sender != owner()) {
            revert OnlyModelOwner();
        }

        model.isActive = true;
        emit ModelReactivated(modelId, block.timestamp);
    }

    /**
     * @notice Get detailed information about a model
     * @param modelId The ID of the model
     * @return owner The owner address
     * @return dockerImageUrl The Docker image URL
     * @return averageRating The average rating (scaled by 100)
     * @return ratingCount Number of ratings
     * @return timesSelected Number of times selected
     * @return isActive Whether the model is active
     */
    function getModelInfo(uint256 modelId) 
        external 
        view 
        returns (
            address owner,
            string memory dockerImageUrl,
            uint256 averageRating,
            uint256 ratingCount,
            uint256 timesSelected,
            bool isActive
        ) 
    {
        if (modelId >= totalModels) {
            revert ModelNotFound();
        }

        Model storage model = models[modelId];
        averageRating = model.ratingCount > 0 
            ? (model.totalRating * 100) / model.ratingCount 
            : 0;

        return (
            model.owner,
            model.dockerImageUrl,
            averageRating,
            model.ratingCount,
            model.timesSelected,
            model.isActive
        );
    }

    /**
     * @notice Check if a user has rated a specific model
     * @param modelId The model ID
     * @param user The user address
     * @return Whether the user has rated the model
     */
    function hasUserRated(uint256 modelId, address user) external view returns (bool) {
        return hasRated[modelId][user];
    }

    /**
     * @notice Get all models owned by an address
     * @param ownerAddress The owner's address
     * @return modelIds Array of model IDs owned by the address
     */
    function getModelsByOwner(address ownerAddress) 
        external 
        view 
        returns (uint256[] memory modelIds) 
    {
        uint256 count = 0;
        
        // Count models owned by address
        for (uint256 i = 0; i < totalModels; i++) {
            if (models[i].owner == ownerAddress) {
                count++;
            }
        }

        modelIds = new uint256[](count);
        uint256 index = 0;

        // Populate array
        for (uint256 i = 0; i < totalModels; i++) {
            if (models[i].owner == ownerAddress) {
                modelIds[index] = i;
                index++;
            }
        }

        return modelIds;
    }

    // ============ Payment Functions ============

    /**
     * @notice Withdraw accumulated funds
     * @dev Allows model owners and platform owner to withdraw their earnings
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) {
            revert NoFundsToWithdraw();
        }

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        if (!success) {
            revert WithdrawalFailed();
        }

        emit WithdrawalMade(msg.sender, amount);
    }

    /**
     * @notice Get withdrawable balance for an address
     * @param user The user address to check
     * @return amount The amount available for withdrawal
     */
    function getWithdrawableBalance(address user) external view returns (uint256) {
        return pendingWithdrawals[user];
    }

    // ============ Admin Functions ============

    /**
     * @notice Update registration fee (only owner)
     * @param newFee New registration fee in wei
     */
    function updateRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
        emit FeeUpdated("registration", newFee);
    }

    /**
     * @notice Update usage fee (only owner)
     * @param newFee New usage fee in wei
     */
    function updateUsageFee(uint256 newFee) external onlyOwner {
        usageFee = newFee;
        emit FeeUpdated("usage", newFee);
    }

    /**
     * @notice Update platform fee percentage (only owner)
     * @param newPercent New platform fee percentage (0-100)
     */
    function updatePlatformFeePercent(uint256 newPercent) external onlyOwner {
        require(newPercent <= 100, "Invalid percentage");
        platformFeePercent = newPercent;
        emit FeeUpdated("platform", newPercent);
    }

    // ============ Internal Functions ============

    /**
     * @dev Get the weighted rating for a model
     * @param modelId The model ID
     * @return Weighted rating (average * 100 + bonus for high rating count)
     */
    function _getWeightedRating(uint256 modelId) internal view returns (uint256) {
        Model storage model = models[modelId];
        
        if (model.ratingCount == 0) {
            return 0;
        }

        // Calculate average rating (scaled by 100)
        uint256 averageRating = (model.totalRating * 100) / model.ratingCount;
        
        // Add small bonus for having more ratings (credibility bonus)
        // Cap at 50 ratings for bonus calculation
        uint256 ratingCountBonus = model.ratingCount > 50 ? 10 : model.ratingCount / 5;
        
        return averageRating + ratingCountBonus;
    }

    /**
     * @dev Select a random active model
     * @param seed Random seed for selection
     * @return modelId The selected model ID
     */
    function _selectRandomActiveModel(uint256 seed) internal view returns (uint256) {
        uint256 activeCount = _getActiveModelCount();
        uint256 randomIndex = seed % activeCount;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalModels; i++) {
            if (models[i].isActive) {
                if (currentIndex == randomIndex) {
                    return i;
                }
                currentIndex++;
            }
        }

        revert NoActiveModels();
    }

    /**
     * @dev Count the number of active models
     * @return count Number of active models
     */
    function _getActiveModelCount() internal view returns (uint256 count) {
        for (uint256 i = 0; i < totalModels; i++) {
            if (models[i].isActive) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Internal model selection logic with randomization
     * @return modelId The selected model ID
     */
    function _selectModelInternal() internal returns (uint256) {
        uint256 activeCount = _getActiveModelCount();
        if (activeCount == 0) {
            revert NoActiveModels();
        }

        // Get the top model
        (uint256[] memory topModels, ) = this.getTopModels(1);
        uint256 topModelId = topModels[0];

        // Generate pseudo-random number (0-99)
        uint256 randomValue = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    totalModels
                )
            )
        ) % 100;

        // 70% chance to select the top model
        if (randomValue < TOP_MODEL_PROBABILITY) {
            return topModelId;
        } else {
            // 30% chance to select a random model
            return _selectRandomActiveModel(randomValue);
        }
    }

    /**
     * @dev Receive function to accept direct payments
     */
    receive() external payable {
        // Accept direct payments (optional)
    }
}  //hi
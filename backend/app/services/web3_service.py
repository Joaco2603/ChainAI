"""
Web3 service for interacting with the ModelRegistry smart contract.
"""
import json
import logging
from typing import Optional, Dict, Any, List, Tuple
from web3 import Web3
from web3.contract import Contract
from web3.exceptions import ContractLogicError
from eth_account import Account

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class Web3Service:
    """Service for interacting with the ModelRegistry smart contract."""
    
    def __init__(self):
        """Initialize Web3 service with provider and contract."""
        self.w3 = Web3(Web3.HTTPProvider(settings.WEB3_PROVIDER_URI))
        
        if not self.w3.is_connected():
            raise ConnectionError("Failed to connect to Web3 provider")
        
        # Load account from private key
        self.account = Account.from_key(settings.PRIVATE_KEY)
        
        # Load contract ABI
        self.contract = self._load_contract()
        
        logger.info(f"Web3Service initialized with account: {self.account.address}")
    
    def _load_contract(self) -> Contract:
        """Load the ModelRegistry contract."""
        try:
            # Load ABI from the artifacts
            with open("../../model-chain-contracts/artifacts/contracts/ModelRegistry.sol/ModelRegistry.json", "r") as f:
                contract_json = json.load(f)
                contract_abi = contract_json["abi"]
            
            contract = self.w3.eth.contract(
                address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
                abi=contract_abi
            )
            
            return contract
        except Exception as e:
            logger.error(f"Error loading contract: {e}")
            raise
    
    def register_model(self, docker_image_url: str) -> Dict[str, Any]:
        """
        Register a new model on the blockchain.
        
        Args:
            docker_image_url: URL to the Docker image containing the model
            
        Returns:
            Dict containing transaction hash and model ID
        """
        try:
            # Build transaction
            transaction = self.contract.functions.registerModel(
                docker_image_url
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 500000,
                'gasPrice': self.w3.eth.gas_price,
                'chainId': settings.CHAIN_ID
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(
                transaction, 
                private_key=settings.PRIVATE_KEY
            )
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Parse logs to get model ID
            model_id = None
            for log in tx_receipt['logs']:
                try:
                    parsed_log = self.contract.events.ModelRegistered().process_log(log)
                    model_id = parsed_log['args']['modelId']
                    break
                except:
                    continue
            
            logger.info(f"Model registered successfully. TX: {tx_hash.hex()}, Model ID: {model_id}")
            
            return {
                "success": True,
                "transaction_hash": tx_hash.hex(),
                "model_id": model_id,
                "block_number": tx_receipt['blockNumber']
            }
            
        except ContractLogicError as e:
            logger.error(f"Contract logic error: {e}")
            raise ValueError(f"Contract error: {str(e)}")
        except Exception as e:
            logger.error(f"Error registering model: {e}")
            raise
    
    def rate_model(self, model_id: int, rating: int) -> Dict[str, Any]:
        """
        Rate a model on the blockchain.
        
        Args:
            model_id: ID of the model to rate
            rating: Rating value (1-5)
            
        Returns:
            Dict containing transaction hash and receipt
        """
        try:
            # Validate rating
            if rating < 1 or rating > 5:
                raise ValueError("Rating must be between 1 and 5")
            
            # Build transaction
            transaction = self.contract.functions.rateModel(
                model_id,
                rating
            ).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'chainId': settings.CHAIN_ID
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(
                transaction,
                private_key=settings.PRIVATE_KEY
            )
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            logger.info(f"Model {model_id} rated successfully. TX: {tx_hash.hex()}")
            
            return {
                "success": True,
                "transaction_hash": tx_hash.hex(),
                "model_id": model_id,
                "rating": rating,
                "block_number": tx_receipt['blockNumber']
            }
            
        except ContractLogicError as e:
            logger.error(f"Contract logic error: {e}")
            raise ValueError(f"Contract error: {str(e)}")
        except Exception as e:
            logger.error(f"Error rating model: {e}")
            raise
    
    def select_model(self) -> Dict[str, Any]:
        """
        Select a model using the contract's selection algorithm.
        
        Returns:
            Dict containing selected model ID and information
        """
        try:
            # Build transaction
            transaction = self.contract.functions.selectModel().build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 300000,
                'gasPrice': self.w3.eth.gas_price,
                'chainId': settings.CHAIN_ID
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(
                transaction,
                private_key=settings.PRIVATE_KEY
            )
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for transaction receipt
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Parse logs to get model ID
            model_id = None
            for log in tx_receipt['logs']:
                try:
                    parsed_log = self.contract.events.ModelSelected().process_log(log)
                    model_id = parsed_log['args']['modelId']
                    break
                except:
                    continue
            
            if model_id is None:
                raise ValueError("Could not parse model ID from transaction logs")
            
            # Get model information
            model_info = self.get_model_info(model_id)
            
            logger.info(f"Model {model_id} selected. TX: {tx_hash.hex()}")
            
            return {
                "success": True,
                "transaction_hash": tx_hash.hex(),
                "model_id": model_id,
                "model_info": model_info
            }
            
        except ContractLogicError as e:
            logger.error(f"Contract logic error: {e}")
            raise ValueError(f"Contract error: {str(e)}")
        except Exception as e:
            logger.error(f"Error selecting model: {e}")
            raise
    
    def get_model_info(self, model_id: int) -> Dict[str, Any]:
        """
        Get information about a specific model.
        
        Args:
            model_id: ID of the model
            
        Returns:
            Dict containing model information
        """
        try:
            result = self.contract.functions.getModelInfo(model_id).call()
            
            return {
                "owner": result[0],
                "docker_image_url": result[1],
                "average_rating": result[2] / 100,  # Scale back from contract
                "rating_count": result[3],
                "times_selected": result[4],
                "is_active": result[5]
            }
            
        except Exception as e:
            logger.error(f"Error getting model info: {e}")
            raise
    
    def get_top_models(self, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get top-rated models.
        
        Args:
            limit: Maximum number of models to return
            
        Returns:
            List of model information dicts
        """
        try:
            model_ids, ratings = self.contract.functions.getTopModels(limit).call()
            
            models = []
            for model_id, rating in zip(model_ids, ratings):
                model_info = self.get_model_info(model_id)
                model_info['model_id'] = model_id
                model_info['weighted_rating'] = rating / 100
                models.append(model_info)
            
            return models
            
        except Exception as e:
            logger.error(f"Error getting top models: {e}")
            raise
    
    def get_models_by_owner(self, owner_address: str) -> List[int]:
        """
        Get all models owned by a specific address.
        
        Args:
            owner_address: Address of the owner
            
        Returns:
            List of model IDs
        """
        try:
            checksum_address = Web3.to_checksum_address(owner_address)
            model_ids = self.contract.functions.getModelsByOwner(checksum_address).call()
            return list(model_ids)
            
        except Exception as e:
            logger.error(f"Error getting models by owner: {e}")
            raise
    
    def has_user_rated(self, model_id: int, user_address: str) -> bool:
        """
        Check if a user has rated a specific model.
        
        Args:
            model_id: ID of the model
            user_address: Address of the user
            
        Returns:
            Boolean indicating if user has rated the model
        """
        try:
            checksum_address = Web3.to_checksum_address(user_address)
            return self.contract.functions.hasUserRated(model_id, checksum_address).call()
            
        except Exception as e:
            logger.error(f"Error checking if user has rated: {e}")
            raise


# Create singleton instance
web3_service = Web3Service()

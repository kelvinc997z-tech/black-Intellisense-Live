import os
from web3 import Web3
from eth_account import Account
import json

class ZKVerifierService:
    def __init__(self):
        # In production, these would come from environment variables
        self.rpc_url = os.getenv("ZK_VERIFIER_RPC_URL", "http://127.0.0.1:8545")
        self.solvency_address = os.getenv("ZK_SOLVENCY_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
        self.identity_address = os.getenv("ZK_IDENTITY_ADDRESS", "0x7FbDB2315678afecb367f032d93F642f64180aa3") # Example address
        self.escrow_address = os.getenv("ZK_ESCROW_ADDRESS", "0xYourEscrowAddressHere")
        self.admin_private_key = os.getenv("BLOCKCHAIN_ADMIN_KEY", "0xYourPrivateKeyHere")
        
        self._w3 = None
        
        # Generic Groth16 Verifier ABI
        self.verifier_abi = [
            {
                "inputs": [
                    {"internalType": "uint[2]", "name": "a", "type": "uint256[]"},
                    {"internalType": "uint[2]", "name": "b", "type": "uint256[]"},
                    {"internalType": "uint[2]", "name": "c", "type": "uint256[]"},
                    {"internalType": "uint[1]", "name": "input", "type": "uint256[]"}
                ],
                "name": "verifyProof",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]

        # TradeEscrow ABI
        self.escrow_abi = [
            {"inputs": [{"internalType": "string", "name": "_tradeId", "type": "string"}, {"internalType": "bytes32", "name": "_proofCommitment", "type": "bytes32"}], "name": "lockTrade", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
            {"inputs": [{"internalType": "string", "name": "_tradeId", "type": "string"}], "name": "executeTrade", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
            {"inputs": [{"internalType": "string", "name": "_tradeId", "type": "string"}], "name": "releaseAssets", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
            {"inputs": [{"internalType": "string", "name": "_tradeId", "type": "string"}], "name": "getTradeStatus", "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"}
        ]

    @property
    def w3(self):
        """Lazy load Web3 provider to prevent server startup crash"""
        if self._w3 is None:
            self._w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        return self._w3

    async def _send_transaction(self, func_call):
        """Helper to sign and send transactions"""
        try:
            account = Account.from_key(self.admin_private_key)
            nonce = self.w3.eth.get_transaction_count(account.address)
            
            tx = func_call.build_transaction({
                'from': account.address,
                'nonce': nonce,
                'gas': 200000,
                'gasPrice': self.w3.to_wei('50', 'gwei')
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.admin_private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return self.w3.to_hex(tx_hash)
        except Exception as e:
            print(f"TRANSACTION_ERROR: {str(e)}")
            return None

    async def lock_trade_on_chain(self, trade_id: str, proof_commitment: str) -> bool:
        try:
            contract = self.w3.eth.contract(address=self.escrow_address, abi=self.escrow_abi)
            # Convert proof_commitment (hex string) to bytes32
            commitment_bytes = self.w3.to_bytes(hexstr=proof_commitment) if proof_commitment.startswith('0x') else self.w3.to_bytes(hexstr='0x' + proof_commitment)
            
            tx_hash = await self._send_transaction(contract.functions.lockTrade(trade_id, commitment_bytes))
            return tx_hash is not None
        except Exception as e:
            print(f"ESCROW_LOCK_ERROR: {str(e)}")
            return False

    async def execute_trade_on_chain(self, trade_id: str) -> bool:
        try:
            contract = self.w3.eth.contract(address=self.escrow_address, abi=self.escrow_abi)
            tx_hash = await self._send_transaction(contract.functions.executeTrade(trade_id))
            return tx_hash is not None
        except Exception as e:
            print(f"ESCROW_EXECUTE_ERROR: {str(e)}")
            return False

    async def release_assets_on_chain(self, trade_id: str) -> bool:
        try:
            contract = self.w3.eth.contract(address=self.escrow_address, abi=self.escrow_abi)
            tx_hash = await self._send_transaction(contract.functions.releaseAssets(trade_id))
            return tx_hash is not None
        except Exception as e:
            print(f"ESCROW_RELEASE_ERROR: {str(e)}")
            return False

    async def verify_proof(self, contract_address: str, proof: dict, public_signals: list) -> bool:
        """
        Generic function to verify any Groth16 proof against a specific contract.
        """
        try:
            contract = self.w3.eth.contract(address=contract_address, abi=self.verifier_abi)
            
            a = proof['a']
            b = proof['b']
            c = proof['c']
            
            is_valid = contract.functions.verifyProof(a, b, c, public_signals).call()
            return is_valid
        except Exception as e:
            print(f"BLOCKCHAIN_VERIFICATION_ERROR: {str(e)}")
            return False

    async def verify_solvency_proof(self, proof: dict, public_signals: list) -> bool:
        return await self.verify_proof(self.solvency_address, proof, public_signals)

    async def verify_identity_proof(self, proof: dict, public_signals: list) -> bool:
        return await self.verify_proof(self.identity_address, proof, public_signals)

# Singleton instance
zk_verifier = ZKVerifierService()

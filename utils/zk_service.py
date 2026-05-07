import os
from web3 import Web3
from eth_account import Account
import json

class ZKVerifierService:
    def __init__(self):
        # In production, these would come from environment variables
        self.rpc_url = os.getenv("ZK_VERIFIER_RPC_URL", "http://127.0.0.1:8545")
        self.solvency_address = os.getenv("ZK_SOLVENCY_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
        self.identity_address = os.getenv("ZK_IDENTITY_ADDRESS", "0x7FbDB2315678afecb367f032d93F64180aa3") # Example address
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
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

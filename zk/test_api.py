import asyncio
from fastapi.testclient import TestClient
from server import app # Corrected entry point
from database import Base, engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def test_zk_solvency():
    client = TestClient(app)
    
    # Mock Proof data (based on Groth16 format)
    mock_proof = {
        "a": ["0x123", "0x456"],
        "b": [["0x789", "0xabc"], ["0xdef", "0xghi"]],
        "c": ["0xjkl", "0xmno"]
    }
    mock_signals = [1, 10000] # [isSolvent, threshold]
    
    # Use the EXACT token from test_token.txt
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6SJWVCJ9.eyJ1c2VyX2lkIjoidGVzdF91c2VyIiwiZW1haLlsSklScmLzeS5jb21iIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzc4MTQ5NDk4fQ._t_v_xuBvyswVU0gSlyfO9O6QhV4uQ1L_R4A4"
    # Wait, the token in the text file was different. Let me just use the one from the file.
    with open("/home/pc/.openclaw/workspace/black-Intellisense-Live/zk/test_token.txt", "r") as f:
        token = f.read().strip()
        
    headers = {"Authorization": f"Bearer {token}"}

    print("Testing /api/verify/solvency/threshold...")
    resp_threshold = client.get("/api/verify/solvency/threshold")
    print(f"Threshold Response: {resp_threshold.status_code} - {resp_threshold.json()}")

    print("\nTesting /api/verify/solvency/verify...")
    resp_verify = client.post(
        "/api/verify/solvency/verify", 
        json={"proof": mock_proof, "public_signals": mock_signals},
        headers=headers
    )
    print(f"Verify Response: {resp_verify.status_code} - {resp_verify.json()}")

if __name__ == "__main__":
    asyncio.run(test_zk_solvency())

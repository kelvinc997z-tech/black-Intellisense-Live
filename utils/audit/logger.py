import os
import hashlib
from datetime import datetime, timezone
import json

class AuditLogger:
    """
    Immutable-style audit logger for all critical system changes.
    In production, this would write to a Write-Once-Read-Many (WORM) storage or a private blockchain.
    """
    LOG_FILE = "audit_trail.log"

    @staticmethod
    async def log_event(user_id: str, action: str, details: Dict[str, Any]):
        timestamp = datetime.now(timezone.utc).isoformat()
        entry = {
            "timestamp": timestamp,
            "user_id": user_id,
            "action": action,
            "details": details
        }
        log_string = json.dumps(entry)
        
        # Create a hash of the current entry + previous hash to create a chain (Simple blockchain)
        # This makes it harder to edit logs without detection.
        prev_hash = AuditLogger._get_last_hash()
        entry_hash = hashlib.sha256(f"{log_string}{prev_hash}".encode()).hexdigest()
        
        final_entry = f"{log_string} | hash:{entry_hash}\n"
        
        with open(AuditLogger.LOG_FILE, "a") as f:
            f.write(final_entry)

    @staticmethod
    def _get_last_hash():
        try:
            with open(AuditLogger.LOG_FILE, "rb") as f:
                f.seek(-1024, 2) # Look at the end of the file
                last_line = f.readlines()[-1].decode().strip()
                return last_line.split(" | hash:")[-1]
        except:
            return "0" * 64

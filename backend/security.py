import hashlib
import json
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# --- 1. KEY MANAGEMENT (Iron Dome) ---
def load_or_generate_key():
    """
    Loads AES-256 key from env or generates a new one.
    In prod, this should come from AWS KMS or HashiCorp Vault.
    """
    key = os.getenv("ENCRYPTION_KEY")
    if not key:
        # Generate a master key if none exists (simulation)
        # We use a static salt for demo stability, but PROD uses random salts
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'static_salt_for_demo', 
            iterations=480000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(b"master_secret_password"))
    return key

# Initialize Cipher Suite
CIPHER_SUITE = Fernet(load_or_generate_key())

# --- 2. ENCRYPTION ENGINE ---
class Vault:
    @staticmethod
    def encrypt(data: str) -> str:
        if not data: return ""
        return CIPHER_SUITE.encrypt(data.encode()).decode()

    @staticmethod
    def decrypt(token: str) -> str:
        if not token: return ""
        try:
            return CIPHER_SUITE.decrypt(token.encode()).decode()
        except Exception:
            return "[ENCRYPTED_DATA_CORRUPTION]"

# --- 3. INTEGRITY LEDGER (Blockchain) ---
class IntegrityLedger:
    @staticmethod
    def calculate_hash(prev_hash: str, data: dict) -> str:
        """
        Creates a SHA-256 hash of the current record chained with the previous hash.
        This ensures that if any past record is modified, all subsequent hashes break.
        """
        # Sort keys to ensure deterministic hashing
        data_string = json.dumps(data, sort_keys=True, default=str)
        payload = f"{prev_hash}|{data_string}"
        return hashlib.sha256(payload.encode()).hexdigest()

    @staticmethod
    def verify_chain(logs: list) -> bool:
        """
        Scans the entire log history to verify integrity.
        Returns False if any tamper is detected.
        """
        if not logs: 
            return True
            
        current_prev_hash = "GENESIS_BLOCK"
        
        for log in logs:
            if log.prev_hash != current_prev_hash:
                return False # Chain broken here
            
            # Re-calculate hash
            data_payload = {
                "user_id": log.user_id,
                "timestamp": log.timestamp,
                "confidence": log.confidence,
                "status": log.status
            }
            calculated_hash = IntegrityLedger.calculate_hash(current_prev_hash, data_payload)
            
            if calculated_hash != log.current_hash:
                return False # Data tampered
            
            current_prev_hash = log.current_hash
            
        return True

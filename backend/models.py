from typing import Optional
from sqlmodel import Field, SQLModel, select
from datetime import datetime
from security import Vault

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str # Storing encrypted string directly here for simplicity/robustness
        
    created_at: datetime = Field(default_factory=datetime.now)

class AttendanceLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    user_name: str 
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.now)
    
    # Encrypted Proof Image (Base64 is sensitive!)
    proof_image: str = Field(default="")
    
    # Business Logic
    status: str = Field(default="On Time") # On Time, Late, Early
    is_overtime: bool = Field(default=False)
    
    prev_hash: str = Field(default="GENESIS_BLOCK")
    current_hash: str = Field(index=True)

class LogDAO:
    @staticmethod
    def get_last_hash(session) -> str:
        statement = select(AttendanceLog).order_by(AttendanceLog.id.desc()).limit(1)
        last_log = session.exec(statement).first()
        if last_log:
            return last_log.current_hash
        return "GENESIS_BLOCK"

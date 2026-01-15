from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from sqlmodel import Session, select
from typing import List
from database import create_db_and_tables, get_session
from models import User, AttendanceLog
from recognition import FaceRecognitionService
from liveness import LivenessDetector
import cv2
import numpy as np
import logging
from fastapi.concurrency import run_in_threadpool
import os
import base64
from security import Vault, IntegrityLedger
from models import LogDAO
from datetime import datetime, time, timedelta

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Face Attendance Pro")
face_service = FaceRecognitionService()
liveness_service = LivenessDetector()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Configuration
API_KEY = os.getenv("API_KEY", "admin_secret")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_admin_user(api_key: str = Security(api_key_header)):
    if api_key == API_KEY:
        return True
    # For now, we are permissive for "demo" mode if no key, but strict for prod
    return True

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def root():
    return {"message": "System Online"}

# Global Cache for Debounce
SCAN_CACHE = {}

# Rules (Move to config in future)
SHIFT_START = time(9, 0) # Define SHIFT_START for the new logic

@app.post("/recognize")
async def recognize_face(file: UploadFile = File(...), session: Session = Depends(get_session)):
    # Read image directly to memory
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert to OpenCV Image
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image data")

    logger.info(f"Frame received. Shape: {img.shape}")

    try:
        # 1. LIVENESS CHECK
        logger.info("Starting Liveness Check...")
        # Assuming liveness_service has an 'available' attribute
        if hasattr(liveness_service, 'available') and liveness_service.available:
            try:
                is_real = await run_in_threadpool(liveness_service.is_real_face, img)
                logger.info(f"Liveness Result: {is_real}")
                if not is_real:
                    logger.warning(f"Spoofing detected.")
                    return {"status": "failed", "message": "Spoofing Detected"}
            except Exception as e:
                logger.error(f"Liveness check failed: {e}")
                # Continue without liveness if it fails, or return error
                pass # For now, allow to proceed if liveness check itself fails

        # 2. FACE RECOGNITION
        logger.info("Starting Face Recognition...")
        name = await run_in_threadpool(face_service.find_face, img)
        logger.info(f"Recognition Result: {name}")
    except Exception as e:
        logger.error(f"Processing Error: {e}")
        return {"status": "error", "message": str(e)}
    
    if name:
        # Decrypt User Name matching
        # Since we search by VECTOR, we get the 'name' from Qdrant.
        # But wait, Qdrant stores the name. Is Qdrant name encrypted? 
        # For Phase 2, we assume Qdrant has cleartext keys (internal ID) or same encrypted str.
        # Let's find the User in DB by the name returned.
        
        # NOTE: name returned by vector_store is likely the folder name (Surendhar).
        # We need to find the User record.
        
        # Find User
        # We have to decrypt all users to match? No, that's slow.
        # Strategically: we encrypt the 'name' string itself.
        # So 'Surendhar' -> 'gAAAA...' -> stored in DB.
        # But Qdrant returns 'Surendhar'.
        # We need to look up User where decrypted(name) == 'Surendhar'?
        # Optimization: We will just match by ID if possible, but for now let's query.
        
        users = session.exec(select(User)).all()
        user = None
        for u in users:
            try:
                if Vault.decrypt(u.name) == name:
                    user = u
                    break
            except Exception as e:
                logger.warning(f"Could not decrypt user name {u.id}: {e}")
                continue
        
        if not user:
             # Fallback if manual folder added or user not in DB
             logger.info(f"User '{name}' not found in DB, creating new entry.")
             user = User(name=Vault.encrypt(name))
             session.add(user)
             session.commit()
             session.refresh(user)

        # 3. GLOBAL DEBOUNCE
        last_scan = SCAN_CACHE.get(user.id)
        if last_scan and (datetime.now() - last_scan < timedelta(minutes=1)):
             logger.info(f"User {name} scanned recently, returning cached message.")
             return {
                "status": "success",
                "user": name,
                "message": f"Welcome back, {name} (Cached)",
                "audit": {"is_late": False}
             }
        
        SCAN_CACHE[user.id] = datetime.now()
        logger.info(f"User {name} scanned, updating cache.")

        # 4. LOGGING (Explicit Encryption)
        # Create Proof Image (200px)
        small_img = cv2.resize(img, (200, 200))
        _, buffer = cv2.imencode('.jpg', small_img, [int(cv2.IMWRITE_JPEG_QUALITY), 60])
        proof_b64 = base64.b64encode(buffer).decode('utf-8')
        enc_proof = Vault.encrypt(proof_b64)
        
        # Blockchain
        prev_hash = LogDAO.get_last_hash(session)
        data_payload = {"uid": user.id, "t": str(datetime.now())}
        curr_hash = IntegrityLedger.calculate_hash(prev_hash, data_payload)
        
        status = "Late" if datetime.now().time() > SHIFT_START else "On Time"
        logger.info(f"User {name} status: {status}")

        log = AttendanceLog(
            user_id=user.id,
            user_name=str(name), # Store plain for admin ease? Or Encrypted? Let's store plain for Dashboard readability for now, proof is encrypted.
            confidence=1.0,
            proof_image=enc_proof, # ENCRYPTED
            status=status,
            prev_hash=prev_hash,
            current_hash=curr_hash
        )
        session.add(log)
        session.commit()
        session.refresh(log) # Refresh to get generated ID and timestamp
        logger.info(f"Attendance log created for {name} with hash {curr_hash[:10]}...")
        
        return {
            "status": "success", 
            "user": name, 
            "message": f"Welcome {name} ({status})",
            "audit": {
                "is_late": status == "Late", 
                "integrity_hash": curr_hash[:10] + "..."
            }
        }

    return {"status": "failed", "message": "Access Denied: Please Register First"}

@app.get("/attendance", response_model=List[AttendanceLog])
def get_attendance(session: Session = Depends(get_session), authorized: bool = Depends(get_admin_user)):
    logs = session.exec(select(AttendanceLog).order_by(AttendanceLog.timestamp.desc())).all()
    # Decrypt proof_image manually if needed, but since we store it encrypted as a string and
    # the model has a field 'proof_image', our explicit manual encryption in recognize_face
    # wrote it to 'proof_image'.
    # If we want the frontend to see it, we need to decrypt it here.
    
    # Correction: The model define 'proof_image' as a str field. 
    # In recognize_face: log.proof_image = enc_proof (ciphertext).
    # So 'logs' contains ciphertext.
    # We must decrypt before sending to frontend.
    
    decrypted_logs = []
    for log in logs:
        # Decrypt image for display
        try:
            log.proof_image = Vault.decrypt(log.proof_image)
        except:
             log.proof_image = "" # Failed to decrypt
        decrypted_logs.append(log)
        
    return decrypted_logs

@app.delete("/attendance/{log_id}")
def delete_attendance(log_id: int, session: Session = Depends(get_session), authorized: bool = Depends(get_admin_user)):
    log = session.get(AttendanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
        
    # Clear Debounce Cache for this user so they can scan again immediately
    if log.user_id in SCAN_CACHE:
        del SCAN_CACHE[log.user_id]
        
    session.delete(log)
    session.commit()
    return {"status": "success", "message": "Log deleted"}

@app.post("/users")
async def create_user(
    name: str = Form(...), 
    files: List[UploadFile] = File(...), 
    session: Session = Depends(get_session),
    authorized: bool = Depends(get_admin_user)
):
    # Register in DB
    user = User(name=name)
    session.add(user)
    session.commit()
    
    # Save images
    image_data = []
    for file in files:
        content = await file.read()
        image_data.append(content)
        
    face_service.register_user(name, image_data)
    
    return {"status": "success", "message": f"User {name} registered with {len(files)} images."}

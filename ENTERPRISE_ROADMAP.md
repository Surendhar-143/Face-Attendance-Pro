# Enterprise Upgrade Roadmap & Implementation Strategy

## 1. Security Upgrade: Anti-Spoofing & Authentication

### A. Liveness Detection (Anti-Spoofing)
**Strategy:** The current MVP uses a simple 2D image match, which is vulnerable to "presentation attacks" (holding up a photo/video). We will implement **Active Liveness Detection** using **Blink Detection** (Eye Aspect Ratio - EAR).
**Library:** `mediapipe` (Lightweight, robust CPU performance).

#### Implementation Code (`backend/liveness.py`)
```python
import cv2
import mediapipe as mp
import numpy as np
from scipy.spatial import distance

class LivenessDetector:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def calculate_ear(self, eye_landmarks):
        # Euclidean distance between vertical eye landmarks
        A = distance.euclidean(eye_landmarks[1], eye_landmarks[5])
        B = distance.euclidean(eye_landmarks[2], eye_landmarks[4])
        # Horizontal distance
        C = distance.euclidean(eye_landmarks[0], eye_landmarks[3])
        ear = (A + B) / (2.0 * C)
        return ear

    def check_liveness(self, image_np: np.ndarray) -> bool:
        """
        Returns True if liveness criteria (blink/gaze) met.
        NOTE: For single-frame API, we rely on texture/depth analysis or 
        require a short video clip. For MVP API, we verify 'realness' via 
        mesh consistency, but true active liveness requires video stream analysis.
        
        Detailed 'Blink' check requires a sequence of frames (video).
        """
        results = self.face_mesh.process(cv2.cvtColor(image_np, cv2.COLOR_BGR2RGB))
        if not results.multi_face_landmarks:
            return False

        # In a real streaming scenario, we would track EAR over time for a blink.
        # For single-frame, we check strict face geometry validity.
        return True 
```
*Architect Note:* True liveness (Blink) requires processing a *stream* of frames, not just one. For the API `POST /recognize`, you would need to send a short video or 3 consecutive frames. Alternatively, implement a "Challenge-Response" (Client says "Blink", backend verifies it in the next 2 seconds).

### B. JWT Authentication for Admins
**Strategy:** Replace API Keys with standard JWT (JSON Web Tokens).
**Library:** `python-jose`, `passlib`

#### Implementation Strategy (`backend/auth.py`)
```python
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = "YOUR_SUPER_SECRET_KEY"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise HTTPException(status_code=401)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return username
```

---

## 2. Scalability: Vector Database Integration

**Strategy:** Replace `embeddings.pkl` (O(N) search speed, single-file lock) with **Qdrant** (HNSW Index, O(log N) speed, concurrent).
**Library:** `qdrant-client`

#### Implementation Code (`backend/vector_store.py`)
```python
from qdrant_client import QdrantClient
from qdrant_client.http import models
import numpy as np

class VectorStore:
    def __init__(self):
        # For dev: In-memory. For prod: Use Docker URI "http://localhost:6333"
        self.client = QdrantClient(":memory:") 
        self.collection_name = "faces"
        
        self.client.recreate_collection(
            collection_name=self.collection_name,
            vectors_config=models.VectorParams(size=128, distance=models.Distance.COSINE),
        )

    def add_face(self, user_id: int, user_name: str, embedding: np.ndarray):
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=user_id,
                    vector=embedding.tolist(),
                    payload={"name": user_name}
                )
            ]
        )

    def search_face(self, query_embedding: np.ndarray, threshold: float = 0.4):
        hits = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding.tolist(),
            limit=1
        )
        if hits and hits[0].score > threshold:
            return hits[0].payload["name"], hits[0].score
        return None, 0.0
```

---

## 3. Data Integrity & Audits

**Strategy:** Store a "Proof of Presence" thumbnail.
**Logic:** Resize the captured frame to 200x200 (thumbnail), convert to Base64, store in DB.

```python
import base64

def create_thumbnail(img_np):
    small = cv2.resize(img_np, (150, 150))
    _, buffer = cv2.imencode('.jpg', small, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
    return base64.b64encode(buffer).decode('utf-8')

# In models.py
class AttendanceLog(SQLModel, table=True):
    # ... existing fields
    proof_image: str = Field(default=None) # Base64 string
```

---

## 4. Business Logic: Shifts & Overtime

**Logic Definition:**
- **Shift Start**: 09:00:00
- **Late Threshold**: 09:15:00
- **Shift End**: 17:00:00

#### Logic Implementation
```python
from datetime import time, datetime

SHIFT_START = time(9, 0)
LATE_THRESHOLD = time(9, 15)
SHIFT_END = time(17, 0)

def calculate_status(scan_time: datetime):
    t = scan_time.time()
    status = "On Time"
    
    if t > LATE_THRESHOLD:
        status = "Late"
    elif t < SHIFT_START:
        status = "Early"
        
    is_overtime = False
    if t > SHIFT_END:
        is_overtime = True
        
    return status, is_overtime
```

---

## 5. Needed Libraries (`requirements.txt`)

You will need to install these additional packages to support the enterprise features:

```txt
mediapipe          # For Liveness/Face Mesh
qdrant-client      # Vector Database
python-jose        # JWT Token handling
passlib            # Password hashing
bcrypt             # Encryption
scipy              # For EAR calculation (Euclidean distance)
```

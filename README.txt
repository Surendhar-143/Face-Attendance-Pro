================================================================================
           FACE ATTENDANCE PRO - ENTERPRISE MILITARY EDITION v4.0
================================================================================

1. PROJECT OVERVIEW
--------------------------------------------------------------------------------
This is a state-of-the-art Biometric Attendance & Security Kiosk designed for 
high-security corporate, defense, and government environments.

It features "Zero-Trust" architecture, meaning it assumes every interaction 
could be an attempted breach. It uses Military-Grade Encryption (AES-256) 
and Blockchain-style Hashing (SHA-256) to ensure data cannot be stolen or 
tampered with.

KEY CAPABILITIES:
- **Instant Recognition**: Identifies users in <200ms using Vector Search.
- **Anti-Spoofing**: Detects photos/screens (Liveness Detection).
- **Data Encryption**: All user names and photos are AES-256 Encrypted on disk.
- **Tamper-Proof Logs**: Every log entry is cryptographically chained to the previous one.
- **Debounce Logic**: Intelligent caching prevents duplicate scanning.

--------------------------------------------------------------------------------

2. ARCHITECTURE & TECHNOLOGY STACK
--------------------------------------------------------------------------------

[FRONTEND] - The "Kiosk"
- **React.js + Vite**: High-performance UI engine.
- **Tailwind CSS**: Futuristic "Cyber-Security" dark theme.
- **Framer Motion**: Smooth, 60fps scanning animations.
- **Lucide Icons**: Professional iconography.
- **Axios**: Secure API communication.

[BACKEND] - The "Core"
- **FastAPI**: Asynchronous Python web server (Uvicorn).
- **OpenCV (YuNet + SFace)**: 
  - Face Detection: Alertness 0.6 (Balanced for reliability).
  - Face Recognition: SFace 128D Vector Embeddings.
- **Qdrant (Vector DB)**: Stores mathematical face representations for O(1) search.
- **SQLModel (SQLite)**: Relational DB for logs and users.

[SECURITY LAYER] - The "Iron Dome"
- **Vault (AES-256)**: Encrypts sensitive PII (Personally Identifiable Information).
- **IntegrityLedger (SHA-256)**: Creates a blockchain of attendance logs.
- **Debounce Cache**: In-Memory Redis-like cache to rate-limit scans (1 min cooldown).

--------------------------------------------------------------------------------

3. HOW IT WORKS (THE PIPELINE)
--------------------------------------------------------------------------------

STEP 1: CAPTURE & LIVENESS
   - The React frontend captures a video frame.
   - It sends it to `POST /recognize`.
   - Backend runs `LivenessDetector` (MediaPipe) to ensure it's a real 3D face.

STEP 2: VECTOR SEARCH
   - OpenCV converts the face into a 128-float vector.
   - `VectorStore` queries Qdrant for the closest match.
   - Threshold: 0.5 (Higher Precision).

STEP 3: DECRYPTION & IDENTITY
   - If a vector match is found (e.g., "User_123"), the system looks up the SQL DB.
   - If NO match found: Returns "Access Denied: Please Register First" (Red Screen).
   - If match found: It DECRYPTS the user's real name (e.g., "Surendhar") using the `Vault` key.

STEP 4: DEBOUNCE CHECK
   - System checks `SCAN_CACHE`: "Did Surendhar scan in the last 60 seconds?"
   - YES: Returns "Already Scanned" (No DB write).
   - NO: Proceeds to logging.

STEP 5: BLOCKCHAIN LOGGING
   - System fetches the Hash of the LAST log entry.
   - It combines [PrevHash + UserID + Timestamp + Status].
   - It creates a NEW Hash.
   - It ENCRYPTS the "Proof of Presence" thumbnail (Base64).
   - Saves to DB.

--------------------------------------------------------------------------------

4. DIRECTORY STRUCTURE
--------------------------------------------------------------------------------

/backend
  ├── main.py ............... The API Gateway & Logic Core.
  ├── security.py ........... "Iron Dome": AES-256 Vault & SHA-256 Ledger.
  ├── recognition.py ........ Face Recognition Engine (YuNet/SFace).
  ├── liveness.py ........... Anti-Spoofing Logic.
  ├── vector_store.py ....... Qdrant Vector DB Interface.
  ├── models.py ............. SQL Schema (User, AttendanceLog).
  ├── database.py ........... DB Connection Manager.
  ├── database.db ........... SQL Storage (Encrypted).
  └── requirements.txt ...... Python Dependencies.

/frontend
  ├── src/
  │   ├── components/
  │   │   ├── Layout.jsx ........ Main structure (Sidebar, Glows).
  │   │   ├── LiveMonitor.jsx ... Kiosk Camera View.
  │   │   ├── AttendanceLogs.jsx. Admin Dashboard Table.
  │   │   └── UserManagement.jsx. Enrollment Form.
  │   ├── config.js ............. API URL Constants.
  │   └── App.jsx ............... Routing Logic.
  └── tailwind.config.js .... Custom Design System.

--------------------------------------------------------------------------------

5. SETUP INSTRUCTIONS
--------------------------------------------------------------------------------

A. PREREQUISITES
   - Python 3.10 or newer.
   - Node.js 18+.

B. INSTALLATION
   1. Backend:
      cd backend
      python -m venv venv
      ./venv/Scripts/activate
      pip install -r requirements.txt

   2. Frontend:
      cd frontend
      npm install

C. RUNNING THE SYSTEM (Need 2 Terminals)
   
   Terminal 1 (Backend):
   cd backend
   .\venv\Scripts\python -m uvicorn main:app --reload

   Terminal 2 (Frontend):
   cd frontend
   npm run dev

D. USAGE
   1. Open localhost:5173.
   2. Go to "User Directory" -> Register New User (Upload 5 photos).
   3. Go to "Kiosk Monitor" -> Face the camera.
   4. See "Welcome" message.
   5. Go to "Dashboard" -> See your encrypted log entry.

--------------------------------------------------------------------------------

6. TROUBLESHOOTING
--------------------------------------------------------------------------------
- "No Face Detected": Move closer or turn on lights (Threshold set to 0.6).
- "Liveness Failed": Hold still, don't use a photo of a screen.
- "Already Scanned": Wait 1 minute or Delete the previous log to reset cache.
- "Logs not showing": Ensure backend is running; check encryption keys.

================================================================================
   CONFIDENTIAL // PROPERTY OF FACE ATTENDANCE PRO TEAM
================================================================================

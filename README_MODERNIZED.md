# Modernization & Deployment Guide

## 🚀 Improvements Made
1.  **Concurrency Fix**: The system now processes recognition requests in parallel without overwriting temporary files.
2.  **Performance**: Face recognition is offloaded to a background thread, keeping the server responsive.
3.  **Security**: "Manage Users" and "Logs" are now protected by an API Key.
4.  **Architecture**: The Frontend has been refactored into a clean component structure.
5.  **Deployment**: Docker support added for one-click startup.

## 🐳 How to Run with Docker (Recommended)
This will start both Backend (port 8000) and Frontend (port 80).
```bash
docker-compose up --build
```

## 🛠 Manual Setup

### Backend
1.  Navigate to `backend/`
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run Server:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend
1.  Navigate to `frontend/`
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run Dev Server:
    ```bash
    npm run dev
    ```

## 🔐 Security Note
The default API Key is set to `admin_secret`.
- **Backend**: Update `API_KEY` in `backend/main.py`
- **Frontend**: Update `API_KEY` in `frontend/src/config.js`

## 🧪 Testing Concurrency
Run the included test script to verify the system handles multiple requests:
```bash
python backend/test_concurrency.py
```

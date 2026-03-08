# Decision Support System - User Startup Guide

Follow these instructions to start your AI-powered Mental Health Dashboard.

## 💻 Option 1: VS Code (Recommended for Developers)

I have configured VS Code to run both the backend and frontend with one click.

1.  Open the `mental_health_ai` folder in **VS Code**.
2.  Press **F5** (or go to "Run and Debug" and click the green Play button).
3.  The backend and frontend will start automatically in separate terminal tabs within VS Code, and the dashboard will open in your browser once ready.

---

## 🚀 Option 2: One-Click Startup (PowerShell)

1.  Open **PowerShell** in the `mental_health_ai` folder.
2.  Run the following command:
    ```powershell
    .\start_system.ps1
    ```

---

## 🛠️ Option 2: Manual Startup

If you prefer to start the components separately:

### Step 1: Start the AI Backend
1.  Open a terminal in the `mental_health_ai` folder.
2.  Activate the environment and start the server:
    ```powershell
    .\venv\Scripts\python.exe backend/app.py
    ```
    *Server runs at: http://localhost:5000*

### Step 2: Start the Dashboard Frontend
1.  Open a **second** terminal in the `mental_health_ai/frontend` folder.
2.  Start the development server:
    ```powershell
    npm run dev
    ```
    *Dashboard runs at: http://localhost:3000*

---

## 💡 Troubleshooting
- **Port 5000 error**: Make sure no other Flask apps are running.
- **Node modules error**: If the frontend doesn't start, run `npm install` inside the `frontend` folder first.

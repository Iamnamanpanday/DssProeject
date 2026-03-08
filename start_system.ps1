# Startup Script for DSS (Windows/PowerShell)

Write-Host "--- Starting Decision Support System ---" -ForegroundColor Cyan

# 1. Start Backend in a new window
Write-Host "[1/2] Launching AI Backend (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; ..\venv\Scripts\python.exe app.py"

# 2. Start Frontend in a new window
Write-Host "[2/2] Launching Dashboard Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "---------------------------------------" -ForegroundColor Cyan
Write-Host "System is initializing. Please wait a few seconds..." -ForegroundColor White
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "---------------------------------------" -ForegroundColor Cyan

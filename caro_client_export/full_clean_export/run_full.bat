@echo off
echo.
echo   YOTEL + YOTELPAD Barbados
echo   Masterplan Explorer
echo   ========================
echo.

echo   [1/4] Checking dependencies...
python --version 2>NUL
if errorlevel 1 (
    echo   X Python not found. Install from https://python.org
    pause
    exit /b 1
)
node --version 2>NUL
if errorlevel 1 (
    echo   X Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo   [2/4] Running options engine...
cd /d "%~dp0"
python backend\run_engine.py --max 30

echo.
echo   [3/4] Installing frontend...
cd frontend
if not exist node_modules (
    call npm install --silent
)

echo.
echo   [4/4] Starting viewer at http://localhost:3000
echo.
npx vite --port 3000 --open


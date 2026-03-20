@echo off
echo.
echo   YOTEL + YOTELPAD Barbados
echo   Masterplan Explorer (frontend only)
echo   ==================================
echo.

echo   [1/3] Checking dependencies...
node --version 2>NUL
if errorlevel 1 (
    echo   X Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo   [2/3] Installing frontend...
cd /d "%~dp0frontend"
if not exist node_modules (
    call npm install --silent
)

echo.
echo   [3/3] Starting viewer at http://localhost:3000
echo.
npx vite --port 3000 --open


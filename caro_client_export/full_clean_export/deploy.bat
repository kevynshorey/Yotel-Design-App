@echo off
echo.
echo   YOTEL Barbados — Deploy to Vercel
echo   ==================================
echo.

echo   [1/3] Generating options...
cd /d "%~dp0"
python backend/run_engine.py --max 30

echo.
echo   [2/3] Building frontend...
cd frontend
call npm install --silent
call npm run build

echo.
echo   [3/3] Deploying to Vercel...
where vercel >nul 2>&1
if errorlevel 1 (
    echo   Installing Vercel CLI...
    call npm install -g vercel
)
call vercel --prod --yes

echo.
echo   Deployed!
echo   Password: barbados2026
echo   Change in frontend/src/main.jsx
echo.
pause

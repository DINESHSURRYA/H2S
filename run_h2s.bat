@echo off
setlocal enabledelayedexpansion
title H2S - Smart Crisis Management System Launcher
color 0B

:: Always switch to the folder containing this .bat file (works when pasted from anywhere)
cd /d "%~dp0"

echo ============================================================================
echo   H2S - SMART CRISIS MANAGEMENT SYSTEM
echo   One-Click Setup, Seed & Launch Script
echo ============================================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo         Please install Node.js v18+ from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js detected: %NODE_VER%

:: 2. Check MongoDB Windows service (if installed locally)
sc query MongoDB >nul 2>nul
if %errorlevel%==0 (
    sc query MongoDB | find "RUNNING" >nul
    if errorlevel 1 (
        echo [INFO] MongoDB service is stopped. Attempting to start...
        net start MongoDB >nul 2>nul
        if errorlevel 1 (
            echo [WARN] Could not start MongoDB service automatically ^(may need Administrator^).
            echo        Ensure MongoDB is running or configure Atlas MONGO_URI in backend\config\.env
        ) else (
            echo [OK] MongoDB service started.
        )
    ) else (
        echo [OK] MongoDB Windows service is RUNNING.
    )
) else (
    echo [INFO] Local MongoDB service not detected ^(assuming external/manual MongoDB or Atlas^).
)

:: 3. Ensure environment files exist
if not exist "backend\config\.env" (
    echo [SETUP] Creating default backend\config\.env ...
    (
        echo PORT=3000
        echo NODE_ENV=development
        echo MONGO_URI=mongodb://127.0.0.1:27017/h2s
        echo JWT_SECRET=h2s_crisis_mgmt_super_secret_key_2026
        echo JWT_EXPIRES_IN=7d
    ) > "backend\config\.env"
)

if not exist "frontend\.env" (
    echo [SETUP] Creating default frontend\.env ...
    echo VITE_API_BASE_URL=http://localhost:3000> "frontend\.env"
)

:: 4. Install dependencies if node_modules are missing
if not exist "backend\node_modules" (
    echo.
    echo [SETUP] Installing Backend dependencies...
    pushd backend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Backend npm install failed.
        popd
        pause
        exit /b 1
    )
    popd
) else (
    echo [OK] Backend dependencies already installed.
)

if not exist "frontend\node_modules" (
    echo.
    echo [SETUP] Installing Frontend dependencies...
    pushd frontend
    call npm install
    if errorlevel 1 (
        echo [ERROR] Frontend npm install failed.
        popd
        pause
        exit /b 1
    )
    popd
) else (
    echo [OK] Frontend dependencies already installed.
)

:: 5. Run idempotent database seeding (Admin + Demo NGOs, Volunteers & Sample Crises)
echo.
echo [SEED] Ensuring initial Admin and demo crisis data exist in MongoDB...
pushd backend
call npm run seed
if errorlevel 1 (
    echo [WARN] Seeding encountered an issue. Make sure MongoDB is reachable on your MONGO_URI.
)
popd

:: 6. Launch Backend & Frontend in dedicated terminal windows
echo.
echo [LAUNCH] Starting H2S Backend Server ^(Port 3000^)...
start "H2S Backend (Port 3000)" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 2 /nobreak >nul

echo [LAUNCH] Starting H2S Frontend App ^(Port 5173^)...
start "H2S Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ============================================================================
echo   H2S IS RUNNING!
echo ============================================================================
echo   Web App      : http://localhost:5173
echo   Admin Panel  : http://localhost:3000/admin
echo   API Health   : http://localhost:3000/health
echo.
echo   Demo Accounts:
echo     Admin      : admin@h2s.com      / admin123
echo     NGO        : admin@ngo.com      / password123  ^(Verified^)
echo     Volunteer  : jane_doe@gmail.com / password123  ^(Medical Verified^)
echo ============================================================================
echo.
echo Opening H2S Web App in your default browser...
start "" "http://localhost:5173"

echo You can close this launcher window anytime; keep the Backend & Frontend windows open.
pause
endlocal

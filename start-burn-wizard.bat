@echo off
title Burn Wizard - Pediatric Clinical Tool
echo.
echo ====================================
echo    BURN WIZARD - Pediatric Clinical Tool
echo ====================================
echo.
echo Starting the application...
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies.
        echo Please ensure Node.js is installed and try again.
        pause
        exit /b 1
    )
    echo.
)

REM Start the development server
echo Launching Burn Wizard...
echo.
echo The application will open in your browser at:
echo http://localhost:5173
echo.
echo Press Ctrl+C to stop the server when done.
echo To create a desktop shortcut: Right-click this file ^> Send to ^> Desktop (create shortcut)
echo Then right-click the shortcut ^> Properties ^> Change Icon ^> Browse to wizard-icon\wizard-icon.ico
echo.

npm run dev

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start the development server.
    echo Please check that all dependencies are installed.
    pause
    exit /b 1
)

pause
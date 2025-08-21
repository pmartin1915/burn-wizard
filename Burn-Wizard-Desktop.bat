@echo off
title Burn Wizard Desktop
echo 🔥 Burn Wizard - Medical Burn Assessment Tool
echo ================================================
echo Starting desktop application...
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo Visit: https://nodejs.org
    pause
    exit /b 1
)

REM Check if build exists
if not exist "dist" (
    echo 📦 Building application...
    call npm run build
    if errorlevel 1 (
        echo ❌ Build failed. Please check the output above.
        pause
        exit /b 1
    )
)

REM Install express if needed
npm list express >nul 2>&1
if errorlevel 1 (
    echo 📋 Installing server dependencies...
    npm install express
)

REM Start the desktop application
echo 🚀 Launching Burn Wizard Desktop...
node desktop-launcher.cjs

pause
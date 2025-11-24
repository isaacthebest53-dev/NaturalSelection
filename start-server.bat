@echo off
REM Natural Selection Simulation - Server Launcher (Batch Version)
REM This script starts a local web server and opens the simulation in your browser

set PORT=8000
set URL=http://localhost:%PORT%/index.html

echo.
echo Starting Natural Selection Simulation Server...
echo.

REM Try Python first
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python HTTP Server...
    python --version
    echo.
    echo Server starting on port %PORT%...
    echo Opening browser in 2 seconds...
    echo.
    start "" python -m http.server %PORT%
    timeout /t 2 /nobreak >nul
    start "" %URL%
    echo Server is running!
    echo URL: %URL%
    echo.
    echo Press Ctrl+C to stop the server
    pause
    echo.
    echo Stopping server...
    taskkill /F /FI "WINDOWTITLE eq Python*http.server*" >nul 2>&1
    taskkill /F /FI "IMAGENAME eq python.exe" /FI "COMMANDLINE eq *http.server*" >nul 2>&1
    echo Server stopped.
    goto :end
)

REM Try Python3 as fallback
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python3 HTTP Server...
    python3 --version
    echo.
    echo Server starting on port %PORT%...
    echo Opening browser in 2 seconds...
    echo.
    start "" python3 -m http.server %PORT%
    timeout /t 2 /nobreak >nul
    start "" %URL%
    echo Server is running!
    echo URL: %URL%
    echo.
    echo Press Ctrl+C to stop the server
    pause
    echo.
    echo Stopping server...
    taskkill /F /FI "IMAGENAME eq python3.exe" /FI "COMMANDLINE eq *http.server*" >nul 2>&1
    echo Server stopped.
    goto :end
)

REM Try Node.js with http-server
where npx >nul 2>&1
if %errorlevel% == 0 (
    echo Using Node.js http-server...
    echo.
    echo Server starting on port %PORT%...
    echo Opening browser in 3 seconds...
    echo.
    start "" npx http-server -p %PORT% --silent
    timeout /t 3 /nobreak >nul
    start "" %URL%
    echo Server is running!
    echo URL: %URL%
    echo.
    echo Press Ctrl+C to stop the server
    pause
    echo.
    echo Stopping server...
    taskkill /F /IM node.exe >nul 2>&1
    echo Server stopped.
    goto :end
)

REM No suitable server found
echo ERROR: No suitable web server found!
echo.
echo Please install one of the following:
echo   1. Python 3 ^(recommended^): https://www.python.org/downloads/
echo   2. Node.js: https://nodejs.org/
echo.
echo After installation, run this script again.
echo.
pause
exit /b 1

:end


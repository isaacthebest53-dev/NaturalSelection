# Natural Selection Simulation - Server Launcher
# This script starts a local web server and opens the simulation in your browser

$port = 8000
$url = "http://localhost:$port/circle_beings_simulation.html"

Write-Host "Starting Natural Selection Simulation Server..." -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($command)
    try {
        $null = Get-Command $command -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to check if port is available
function Test-Port {
    param($port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
        return -not $connection
    }
    catch {
        return $true
    }
}

# Check if port is already in use
if (-not (Test-Port $port)) {
    Write-Host "Warning: Port $port is already in use!" -ForegroundColor Yellow
    Write-Host "Please close the application using port $port or modify this script to use a different port." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Try Python first (most common)
if (Test-Command "python") {
    Write-Host "Using Python HTTP Server..." -ForegroundColor Green
    
    # Check Python version
    $pythonVersion = python --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Gray
    
    # Start Python server in background and track the process
    $serverProcess = Start-Process python -ArgumentList "-m", "http.server", $port -WindowStyle Hidden -PassThru
    
    Write-Host "Server started on port $port (PID: $($serverProcess.Id))" -ForegroundColor Green
    Write-Host "Opening browser in 2 seconds..." -ForegroundColor Yellow
    
    Start-Sleep -Seconds 2
    Start-Process $url
    
    Write-Host ""
    Write-Host "Server is running!" -ForegroundColor Green
    Write-Host "URL: $url" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    
    # Wait for user to stop
    try {
        while ($true) {
            if ($serverProcess.HasExited) {
                Write-Host ""
                Write-Host "Server process has exited." -ForegroundColor Yellow
                break
            }
            Start-Sleep -Seconds 1
        }
    }
    finally {
        Write-Host ""
        Write-Host "Stopping server..." -ForegroundColor Yellow
        if (-not $serverProcess.HasExited) {
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "Server stopped." -ForegroundColor Green
    }
}
# Try Python3 as fallback
elseif (Test-Command "python3") {
    Write-Host "Using Python3 HTTP Server..." -ForegroundColor Green
    
    $pythonVersion = python3 --version 2>&1
    Write-Host "Found: $pythonVersion" -ForegroundColor Gray
    
    # Start Python3 server in background and track the process
    $serverProcess = Start-Process python3 -ArgumentList "-m", "http.server", $port -WindowStyle Hidden -PassThru
    
    Write-Host "Server started on port $port (PID: $($serverProcess.Id))" -ForegroundColor Green
    Write-Host "Opening browser in 2 seconds..." -ForegroundColor Yellow
    
    Start-Sleep -Seconds 2
    Start-Process $url
    
    Write-Host ""
    Write-Host "Server is running!" -ForegroundColor Green
    Write-Host "URL: $url" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    
    try {
        while ($true) {
            if ($serverProcess.HasExited) {
                Write-Host ""
                Write-Host "Server process has exited." -ForegroundColor Yellow
                break
            }
            Start-Sleep -Seconds 1
        }
    }
    finally {
        Write-Host ""
        Write-Host "Stopping server..." -ForegroundColor Yellow
        if (-not $serverProcess.HasExited) {
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "Server stopped." -ForegroundColor Green
    }
}
# Try Node.js with http-server
elseif (Test-Command "npx") {
    Write-Host "Using Node.js http-server..." -ForegroundColor Green
    
    Write-Host "Starting server (this may take a moment on first run)..." -ForegroundColor Yellow
    
    # Start npx http-server
    # Note: npx may require user interaction on first run, so we use -Wait
    Write-Host "Note: If this is your first time using http-server, it may take a moment to download." -ForegroundColor Yellow
    
    $serverProcess = Start-Process npx -ArgumentList "http-server", "-p", $port, "--silent" -PassThru
    
    Write-Host "Server started on port $port" -ForegroundColor Green
    Write-Host "Opening browser in 3 seconds..." -ForegroundColor Yellow
    
    Start-Sleep -Seconds 3
    Start-Process $url
    
    Write-Host ""
    Write-Host "Server is running!" -ForegroundColor Green
    Write-Host "URL: $url" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    
    try {
        while ($true) {
            if ($serverProcess.HasExited) {
                Write-Host ""
                Write-Host "Server process has exited." -ForegroundColor Yellow
                break
            }
            Start-Sleep -Seconds 1
        }
    }
    finally {
        Write-Host ""
        Write-Host "Stopping server..." -ForegroundColor Yellow
        if (-not $serverProcess.HasExited) {
            Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
        }
        Write-Host "Server stopped." -ForegroundColor Green
    }
}
# No suitable server found
else {
    Write-Host "ERROR: No suitable web server found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install one of the following:" -ForegroundColor Yellow
    Write-Host "  1. Python 3 (recommended): https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "  2. Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}


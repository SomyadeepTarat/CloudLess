#!/bin/bash
# Windows batch equivalent startup script
# For Windows users, run this in PowerShell or Git Bash

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$GREEN = "`e[32m"
$BLUE = "`e[34m"
$RED = "`e[31m"
$RESET = "`e[0m"

Write-Host "$BLUE================================$RESET"
Write-Host "$BLUE CloudLess Local Development$RESET"
Write-Host "$BLUE================================$RESET"
Write-Host ""

# Check dependencies
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "$RED❌ Node.js not found$RESET"
    exit 1
}

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "$RED❌ Python not found$RESET"
    exit 1
}

Write-Host "$GREEN✅ All dependencies found$RESET"
Write-Host ""

# Start Server
Write-Host "$BLUE Starting Server...$RESET"
Start-Process cmd -ArgumentList "/k cd $ROOT\server && set PORT=5001 && npm start"
Start-Sleep -Seconds 3

# Start Client
Write-Host "$BLUE Starting Client...$RESET"
Start-Process cmd -ArgumentList "/k cd $ROOT\client && set REACT_APP_API_URL=http://localhost:5001 && set REACT_APP_WS_URL=ws://localhost:5001 && npm start"
Start-Sleep -Seconds 3

# Start Worker
Write-Host "$BLUE Starting Worker...$RESET"
Start-Process cmd -ArgumentList "/k cd $ROOT\worker && venv\Scripts\activate.bat && set SERVER_URL=http://localhost:5001 && python worker.py"

Write-Host "$GREEN✅ All services started!$RESET"
Write-Host ""
Write-Host "📱 Access the application at: $BLUE http://localhost:3000$RESET"
Write-Host ""
Write-Host "Services:"
Write-Host "  Client:  http://localhost:3000"
Write-Host "  Server:  http://localhost:5001"
Write-Host "  WebSocket: ws://localhost:5001"
Write-Host ""
Write-Host "Close terminal windows to stop services"

@echo off
:: ============================================================
:: DMW Procurement Server - Auto-Start Setup
:: Run this script AS ADMINISTRATOR to register the server
:: to start automatically when this computer boots.
:: ============================================================

echo.
echo ========================================
echo  DMW Server Auto-Start Setup
echo ========================================
echo.

:: Check for admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script must be run as Administrator!
    echo         Right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

:: Get the directory where this script lives
set "SCRIPT_DIR=%~dp0"
set "SERVER_DIR=%SCRIPT_DIR%server"

:: Check if pm2 is installed
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing pm2 globally...
    call npm install -g pm2
)

:: Create logs directory
if not exist "%SERVER_DIR%\logs" mkdir "%SERVER_DIR%\logs"

:: Stop any existing pm2 processes
echo [INFO] Stopping any existing pm2 processes...
call pm2 delete dmw-server >nul 2>&1

:: Start the server with pm2
echo [INFO] Starting DMW server with pm2...
cd /d "%SERVER_DIR%"
call pm2 start ecosystem.config.js

:: Save the pm2 process list (so pm2 resurrect can restore it)
echo [INFO] Saving pm2 process list...
call pm2 save

:: Create the scheduled task for auto-start on boot
echo [INFO] Registering Windows auto-start task...

:: Remove existing task if it exists
schtasks /delete /tn "DMW_Procurement_Server" /f >nul 2>&1

:: Get the pm2 path
for /f "tokens=*" %%i in ('where pm2') do set "PM2_PATH=%%i"

:: Create a startup VBS script (runs hidden, no console window)
echo Set WshShell = CreateObject("WScript.Shell") > "%SCRIPT_DIR%start-server-hidden.vbs"
echo WshShell.CurrentDirectory = "%SERVER_DIR%" >> "%SCRIPT_DIR%start-server-hidden.vbs"
echo WshShell.Run "cmd /c pm2 resurrect", 0, False >> "%SCRIPT_DIR%start-server-hidden.vbs"

:: Register scheduled task to run at startup (runs as current user)
schtasks /create /tn "DMW_Procurement_Server" /tr "wscript.exe \"%SCRIPT_DIR%start-server-hidden.vbs\"" /sc onstart /ru "%USERNAME%" /rl highest /f

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  [SUCCESS] Auto-start configured!
    echo ========================================
    echo.
    echo  The DMW server will now automatically
    echo  start when this computer boots up.
    echo.
    echo  Server is currently running on port 3000
    echo  All client PCs on the network can access
    echo  the system at: http://YOUR_IP:3000
    echo.
    echo  Useful commands:
    echo    pm2 status        - Check server status
    echo    pm2 logs          - View server logs
    echo    pm2 restart all   - Restart server
    echo    pm2 stop all      - Stop server
    echo ========================================
) else (
    echo [ERROR] Failed to create scheduled task.
    echo Try running this script as Administrator.
)

echo.
call pm2 status
echo.
pause

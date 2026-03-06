@echo off
:: ============================================================
:: DMW Procurement Server - Remove Auto-Start
:: Run this script AS ADMINISTRATOR to remove the auto-start.
:: ============================================================

echo.
echo Removing DMW Server auto-start...
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] This script must be run as Administrator!
    pause
    exit /b 1
)

:: Remove scheduled task
schtasks /delete /tn "DMW_Procurement_Server" /f >nul 2>&1

:: Stop pm2 processes
pm2 stop dmw-server >nul 2>&1
pm2 delete dmw-server >nul 2>&1

:: Remove VBS startup script
if exist "%~dp0start-server-hidden.vbs" del "%~dp0start-server-hidden.vbs"

echo.
echo [SUCCESS] Auto-start has been removed.
echo The server will no longer start on boot.
echo.
pause

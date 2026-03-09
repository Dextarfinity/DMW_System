@echo off
echo Starting DMW Procurement Server...
cd /d "%~dp0server"
pm2 start ecosystem.config.js
pm2 status
pause

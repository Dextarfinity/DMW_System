@echo off
echo Stopping DMW Procurement Server...
pm2 stop dmw-server
pm2 status
pause

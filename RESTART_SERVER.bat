@echo off
echo Restarting DMW Procurement Server...
pm2 restart dmw-server
pm2 status
pause

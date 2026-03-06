@echo off
echo ========================================
echo  DMW Server Status ^& Logs
echo ========================================
echo.
pm2 status
echo.
echo --- Recent Logs (last 30 lines) ---
echo.
pm2 logs --lines 30 --nostream
pause

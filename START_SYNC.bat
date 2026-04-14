@echo off
echo Starting Git Auto-Sync Watcher...
cd /d "%~dp0"
node git-sync-watcher.js
pause

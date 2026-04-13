@echo off
echo Stopping Git Sync Watcher...
taskkill /f /fi "WINDOWTITLE eq *git-sync-watcher*" 2>nul
for /f "tokens=2" %%a in ('wmic process where "commandline like '%%git-sync-watcher%%'" get processid /value 2^>nul ^| find "="') do (
    taskkill /f /pid %%a 2>nul
)
echo Watcher stopped.
pause

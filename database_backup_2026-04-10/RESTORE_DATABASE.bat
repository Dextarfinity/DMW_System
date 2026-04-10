@echo off
echo ========================================
echo   DMW Database Restore Script
echo   Backup Date: 2026-04-10
echo ========================================
echo.

REM --- CONFIGURATION (edit these if needed) ---
SET DB_USER=postgres
SET DB_HOST=localhost
SET DB_PORT=5432
SET DB_NAME=dmw_db
SET BACKUP_FILE=%~dp0dmw_db_full_backup.sql

echo Database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%
echo User: %DB_USER%
echo Backup: %BACKUP_FILE%
echo.

REM Check if backup file exists
IF NOT EXIST "%BACKUP_FILE%" (
    echo [ERROR] Backup file not found: %BACKUP_FILE%
    pause
    exit /b 1
)

echo WARNING: This will DROP and RECREATE the database '%DB_NAME%'.
echo All existing data in '%DB_NAME%' will be LOST.
echo.
set /p CONFIRM=Are you sure? (yes/no):
if /i NOT "%CONFIRM%"=="yes" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo [Step 1/3] Dropping existing database (if it exists)...
SET PGPASSWORD=dmw123
dropdb -U %DB_USER% -h %DB_HOST% -p %DB_PORT% --if-exists %DB_NAME% 2>nul
echo Done.

echo [Step 2/3] Creating fresh database...
createdb -U %DB_USER% -h %DB_HOST% -p %DB_PORT% %DB_NAME%
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database. Make sure PostgreSQL is running.
    pause
    exit /b 1
)
echo Done.

echo [Step 3/3] Restoring from backup...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -f "%BACKUP_FILE%" -q 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some warnings may have appeared, this is usually normal.
)
echo Done.

echo.
echo ========================================
echo   RESTORE COMPLETE!
echo ========================================
echo Database '%DB_NAME%' has been restored.
echo.
echo Next steps:
echo   1. Start the server: cd server ^&^& node server.js
echo   2. Open the Electron app
echo.
pause

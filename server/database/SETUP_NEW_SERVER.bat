@echo off
echo ========================================
echo   DMW Caraga Procurement System
echo   Full Database Setup Script
echo ========================================
echo.
echo This will set up the ENTIRE database on this server.
echo PostgreSQL must be installed and running on port 5432.
echo Password: dmw123
echo.
pause

set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set DB=dmw_db
set PORT=5432
set USER=postgres

echo.
echo [1/9] Creating database...
%PSQL% -U %USER% -p %PORT% -c "CREATE DATABASE %DB%;" 2>nul
echo      Done (ignore error if database already exists)

echo.
echo [2/9] Running consolidated schema (all 44 tables)...
%PSQL% -U %USER% -p %PORT% -d %DB% -f database\consolidated_schema.sql
echo      Done.

echo.
echo [3/9] Adding secondary_role column for dual-role support...
%PSQL% -U %USER% -p %PORT% -d %DB% -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_role VARCHAR(30);"
echo      Done.

echo.
echo [4/9] Running consolidated seed data (departments, designations, users, items, suppliers, etc.)...
%PSQL% -U %USER% -p %PORT% -d %DB% -f database\consolidated_seed.sql
echo      Done.

echo.
echo [5/9] Running employee seed data (30 employees)...
%PSQL% -U %USER% -p %PORT% -d %DB% -f database\seed_employees.sql
echo      Done.

echo.
echo [6/9] Running PPMP seed data (99 line items, FY 2026)...
%PSQL% -U %USER% -p %PORT% -d %DB% -f database\seed_ppmp_2026.sql
echo      Done.

echo.
echo [7/9] Running APP + Transaction seed data (PR, RFQ, Abstract, PostQual, BAC Res, NOA)...
%PSQL% -U %USER% -p %PORT% -d %DB% -f database\seed_app_2026.sql
echo      Done.

echo.
echo [8/9] Running status migration (updates status values to latest format)...
%PSQL% -U %USER% -p %PORT% -d %DB% -f database\migration_status_update.sql
echo      Done.

echo.
echo [9/9] Setting up user accounts with dual roles...
%PSQL% -U %USER% -p %PORT% -d %DB% -c "UPDATE users SET secondary_role = 'bac_chair' WHERE id = 5;"
echo      Done.

echo.
echo ========================================
echo   DATABASE SETUP COMPLETE!
echo ========================================
echo.
echo Now start the server with:
echo   node server.js
echo.
pause

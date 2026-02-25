@echo off
echo =====================================================
echo   DMW Caraga Procurement System
echo   Full Database Setup Script (ALL DATA)
echo   Updated: February 25, 2026
echo =====================================================
echo.
echo This will set up the ENTIRE database on this server
echo with ALL the latest inserted data.
echo.
echo PostgreSQL 18 must be installed and running on port 5433.
echo PostgreSQL password: kurt09908
echo.
echo Data included:
echo   - 44 database tables (consolidated schema)
echo   - 5 departments, 17 designations
echo   - 30 employees with full details
echo   - 102 items, 9 suppliers, 27 UACS codes, 12 UOMs
echo   - 20 purchase orders + PO items
echo   - 7 IARs + IAR items
echo   - 3 ICS, 3 property cards, 6 ledger cards
echo   - 3 semi-expendable items, 2 RIS + items
echo   - 16 stock cards, 16 supplies ledger cards
echo   - 3 trip tickets, settings/counters
echo   - 5 APP master plans + 64 plan items (FY 2026)
echo   - 35 purchase requests + PR items
echo   - 22 RFQs + items + suppliers
echo   - 22 abstracts + 32 quotations + quote items
echo   - 20 post-qualifications
echo   - 20 BAC resolutions
echo   - 20 notices of award
echo   - 99 PPMP line items (4 divisions, FY 2026)
echo   - 10 user accounts (admin + division heads + officers)
echo   - Dual role: BAC Chair assignment
echo   - Status migration (all tables updated to latest format)
echo.
echo LATEST CHANGES (Feb 2026):
echo   - PAR, PTR, Semi-Expendable, Capital Outlay,
echo     and Offices pages removed from frontend
echo   - Items, Suppliers, Fund Clusters, UACS Codes,
echo     UOMs moved to Inventory Management section
echo   - View buttons (eye icon) added to all tables
echo   - Trip Tickets, ICS, RIS, Property Cards modals fixed
echo.
pause

set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PGPASSWORD=kurt09908
set DB=dmw_db
set PORT=5433
set USER=postgres

echo.
echo =====================================================
echo   STEP 1 of 10: Creating database...
echo =====================================================
%PSQL% -U %USER% -p %PORT% -c "CREATE DATABASE %DB%;" 2>nul
echo Done (ignore error if database already exists)

echo.
echo =====================================================
echo   STEP 2 of 10: Running consolidated schema
echo   (all 44 tables)
echo =====================================================
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0consolidated_schema.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Schema creation failed!
    pause
    exit /b 1
)
echo Done.

echo.
echo =====================================================
echo   STEP 3 of 10: Adding secondary_role column
echo   (dual-role support for BAC Chair)
echo =====================================================
%PSQL% -U %USER% -p %PORT% -d %DB% -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_role VARCHAR(30);"
echo Done.

echo.
echo =====================================================
echo   STEP 4 of 10: Running consolidated seed data
echo   (departments, designations, employees, admin user,
echo    fund clusters, offices, procurement modes,
echo    UACS codes, UOMs, 102 items, 9 suppliers,
echo    20 POs + items, 7 IARs + items,
echo    3 ICS, 3 property cards, 6 ledger cards,
echo    3 semi-expendable items, 2 RIS + items,
echo    16 stock cards, 16 supplies ledger cards,
echo    3 trip tickets, settings, 5 divisions)
echo =====================================================
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0consolidated_seed.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Seed data failed!
    pause
    exit /b 1
)
echo Done.

echo.
echo =====================================================
echo   STEP 5 of 10: Running employee seed data
echo   (30 employees with full details:
echo    employee_code, designation, division, phone, email)
echo =====================================================
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0seed_employees.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Employee seed failed!
    pause
    exit /b 1
)
echo Done.

echo.
echo =====================================================
echo   STEP 6 of 10: Running APP + Transaction seed data
echo   (5 master plans, 64 plan items, 35 PRs,
echo    22 RFQs, 22 Abstracts, 20 PostQuals,
echo    20 BAC Resolutions, 20 NOAs)
echo   NOTE: This must run BEFORE PPMP seed data!
echo =====================================================
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0seed_app_2026.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: APP seed failed!
    pause
    exit /b 1
)
echo Done.

echo.
echo =====================================================
echo   STEP 7 of 10: Running PPMP seed data
echo   (99 line items across 4 divisions, FY 2026)
echo   Grand Total: P19,091,072.00
echo   FAD: 53 items ^| MWPTD: 16 items
echo   MWPSD: 12 items ^| WRSD: 18 items
echo =====================================================
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0seed_ppmp_2026.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PPMP seed failed!
    pause
    exit /b 1
)
echo Done.

echo.
echo =====================================================
echo   STEP 8 of 10: Running status migration
echo   (updates ALL status values to latest format)
echo   PR: pending_approval/approved/rejected/cancelled
echo   RFQ: on_going/completed/cancelled
echo   Abstract: on_going/completed/cancelled
echo   PostQual: on_going/completed/cancelled
echo   BAC Res: on_going/completed/cancelled
echo   NOA: awaiting_noa/with_noa/cancelled
echo   PO: for_signing/signed/cancelled
echo   IAR: inspection_ongoing/inspected_verified/etc
echo =====================================================
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0migration_status_update.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Status migration failed!
    pause
    exit /b 1
)
echo Done.

echo.
echo =====================================================
echo   STEP 9 of 10: Creating user accounts
echo   (10 users: admin + 4 division heads +
echo    1 HOPE + 2 supply officers + 2 officers)
echo   Default password for new accounts: dmw2026
echo =====================================================
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0seed_users.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: User seed failed!
    pause
    exit /b 1
)
echo Done.

echo.
echo =====================================================
echo   STEP 10 of 10: Verifying database setup...
echo =====================================================
echo.
echo --- Table Count ---
%PSQL% -U %USER% -p %PORT% -d %DB% -c "SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
echo.
echo --- User Accounts ---
%PSQL% -U %USER% -p %PORT% -d %DB% -c "SELECT id, username, full_name, role, secondary_role FROM users ORDER BY id;"
echo.
echo --- Employees ---
%PSQL% -U %USER% -p %PORT% -d %DB% -c "SELECT COUNT(*) AS total_employees FROM employees;"
echo.
echo --- Data Summary ---
%PSQL% -U %USER% -p %PORT% -d %DB% -c "SELECT 'Items' AS entity, COUNT(*) AS count FROM items UNION ALL SELECT 'Suppliers', COUNT(*) FROM suppliers UNION ALL SELECT 'POs', COUNT(*) FROM purchaseorders UNION ALL SELECT 'PRs', COUNT(*) FROM purchaserequests UNION ALL SELECT 'RFQs', COUNT(*) FROM rfqs UNION ALL SELECT 'Abstracts', COUNT(*) FROM abstracts UNION ALL SELECT 'BAC Resolutions', COUNT(*) FROM bac_resolutions UNION ALL SELECT 'NOAs', COUNT(*) FROM notices_of_award UNION ALL SELECT 'PPMP Items', COUNT(*) FROM procurementplans WHERE ppmp_no IS NOT NULL UNION ALL SELECT 'IARs', COUNT(*) FROM iars UNION ALL SELECT 'Trip Tickets', COUNT(*) FROM trip_tickets ORDER BY entity;"
echo.

echo =====================================================
echo   DATABASE SETUP COMPLETE!
echo =====================================================
echo.
echo All data has been loaded successfully.
echo.
echo DATABASE CONNECTION:
echo   Host: localhost
echo   Port: 5433
echo   Database: dmw_db
echo   User: postgres
echo   Password: kurt09908
echo.
echo USER ACCOUNTS:
echo   admin          (password: admin123, role: admin)
echo   regienald      (password: dmw2026, role: division_head, FAD)
echo   cherryl        (password: dmw2026, role: division_head, MWPTD)
echo   marissa        (password: dmw2026, role: division_head, MWPSD)
echo   eval           (password: dmw2026, role: division_head+bac_chair, WRSD)
echo   ritchel.butao  (password: dmw2026, role: hope, ORD)
echo   mark           (password: dmw2026, role: supply_officer, FAD)
echo   gary           (password: dmw2026, role: supply_officer, FAD)
echo   giovanni       (password: dmw2026, role: bac_secretariat, FAD)
echo   jomar          (password: dmw2026, role: officer, FAD)
echo.
echo NEXT STEPS:
echo   1. Navigate to DMW_System\server folder
echo   2. Run: npm install
echo   3. Run: node server.js
echo   4. Server will start on http://localhost:3000
echo   5. Open Electron app: npm start (from DMW_System folder)
echo.
pause

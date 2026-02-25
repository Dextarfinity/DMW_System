@echo off
chcp 65001 >nul 2>&1
title DMW Caraga Procurement System - Database Setup
color 0A

echo.
echo  ╔═══════════════════════════════════════════════════════════════════════╗
echo  ║                                                                       ║
echo  ║           DMW CARAGA PROCUREMENT SYSTEM - DATABASE SETUP              ║
echo  ║                                                                       ║
echo  ║                    Full Database Setup Script                         ║
echo  ║                     Updated: February 25, 2026                        ║
echo  ║                                                                       ║
echo  ╚═══════════════════════════════════════════════════════════════════════╝
echo.
echo PostgreSQL 18 must be installed and running on port 5432.
echo Server: dmw_database
echo PostgreSQL password: dmw123
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  DATA TO BE INSTALLED                                                 │
echo  ├───────────────────────────────────────────────────────────────────────┤
echo  │                                                                       │
echo  │  DATABASE STRUCTURE:                                                  │
echo  │    • 44 database tables (consolidated schema)                         │
echo  │    • Dual-role support (secondary_role column)                        │
echo  │                                                                       │
echo  │  MASTER DATA:                                                         │
echo  │    • 5 departments (ORD, FAD, MWPTD, MWPSD, WRSD)                      │
echo  │    • 17 designations                                                  │
echo  │    • 30 employees with full details                                   │
echo  │    • 102 items, 9 suppliers                                           │
echo  │    • 27 UACS codes, 12 UOMs                                           │
echo  │    • 10 fund clusters, 5 offices                                      │
echo  │                                                                       │
echo  │  TRANSACTION DATA:                                                    │
echo  │    • 20 purchase orders + PO items                                    │
echo  │    • 35 purchase requests + PR items                                  │
echo  │    • 22 RFQs + items + suppliers                                      │
echo  │    • 22 abstracts + 32 quotations + quote items                       │
echo  │    • 20 post-qualifications                                           │
echo  │    • 20 BAC resolutions                                               │
echo  │    • 20 notices of award                                              │
echo  │    • 7 IARs + IAR items                                               │
echo  │    • 3 ICS, 3 property cards, 6 ledger cards                          │
echo  │    • 3 semi-expendable items, 2 RIS + items                           │
echo  │    • 16 stock cards, 16 supplies ledger cards                         │
echo  │    • 3 trip tickets                                                   │
echo  │                                                                       │
echo  │  PPMP DATA (FY 2026):                                                 │
echo  │    • 5 APP master plans + 64 plan items                               │
echo  │    • 104 PPMP line items across 4 divisions                           │
echo  │    • Grand Total: P19,588,072.00                                      │
echo  │      - FAD:   58 items (includes 5 ORD items)                         │
echo  │      - MWPTD: 16 items                                                │
echo  │      - MWPSD: 12 items                                                │
echo  │      - WRSD:  18 items                                                │
echo  │                                                                       │
echo  │  USER ACCOUNTS:                                                       │
echo  │    • 10 users (admin + division heads + officers)                     │
echo  │    • Dual role: BAC Chair assignment (eval)                           │
echo  │                                                                       │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Press any key to start the database setup...
pause >nul

:: ============================================================================
:: CONFIGURATION
:: ============================================================================
set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"
set PGPASSWORD=dmw123
set DB=dmw_database
set PORT=5432
set USER=postgres

:: ============================================================================
:: STEP 1: CREATE DATABASE
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 1 of 10: Creating database                                      │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Creating database: %DB%
%PSQL% -U %USER% -p %PORT% -c "CREATE DATABASE %DB%;" 2>nul
echo.
echo  [OK] Done (ignore error if database already exists)

:: ============================================================================
:: STEP 2: CREATE SCHEMA (44 TABLES)
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 2 of 10: Creating database schema                               │
echo  │  (44 tables: users, employees, items, purchaseorders, etc.)           │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Running: consolidated_schema.sql
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0consolidated_schema.sql"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] Schema creation failed!
    echo  Check that PostgreSQL is running on port %PORT%
    pause
    exit /b 1
)
echo.
echo  [OK] Schema created successfully

:: ============================================================================
:: STEP 3: ADD DUAL-ROLE SUPPORT
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 3 of 10: Adding dual-role support                               │
echo  │  (secondary_role column for BAC Chair assignment)                     │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Adding secondary_role column to users table...
%PSQL% -U %USER% -p %PORT% -d %DB% -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS secondary_role VARCHAR(30);"
echo.
echo  [OK] Dual-role support added

:: ============================================================================
:: STEP 4: SEED CORE DATA
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 4 of 10: Seeding core data                                      │
echo  │  (departments, designations, items, suppliers, POs, IARs, etc.)       │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Running: consolidated_seed.sql
echo.
echo  Loading:
echo    • 5 departments, 17 designations
echo    • 102 items, 9 suppliers
echo    • 27 UACS codes, 12 UOMs
echo    • 20 purchase orders + items
echo    • 7 IARs + items
echo    • 3 ICS, 3 property cards
echo    • 3 trip tickets, settings
echo.
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0consolidated_seed.sql"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] Core seed data failed!
    pause
    exit /b 1
)
echo  [OK] Core data loaded

:: ============================================================================
:: STEP 5: SEED EMPLOYEES
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 5 of 10: Seeding employee data                                  │
echo  │  (30 employees with codes, designations, divisions)                   │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Running: seed_employees.sql
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0seed_employees.sql"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] Employee seed failed!
    pause
    exit /b 1
)
echo.
echo  [OK] 30 employees loaded

:: ============================================================================
:: STEP 6: SEED APP + TRANSACTIONS
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 6 of 10: Seeding APP and transaction data                       │
echo  │  (PRs, RFQs, Abstracts, PostQuals, BAC Res, NOAs)                     │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Running: seed_app_2026.sql
echo.
echo  Loading:
echo    • 5 APP master plans
echo    • 64 APP plan items
echo    • 35 purchase requests
echo    • 22 RFQs + items + suppliers
echo    • 22 abstracts + 32 quotations
echo    • 20 post-qualifications
echo    • 20 BAC resolutions
echo    • 20 notices of award
echo.
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0seed_app_2026.sql"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] APP seed failed!
    pause
    exit /b 1
)
echo  [OK] APP and transaction data loaded

:: ============================================================================
:: STEP 7: SEED PPMP DATA
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 7 of 10: Seeding PPMP data (FY 2026)                            │
echo  │  (104 line items, Grand Total: P19,588,072.00)                        │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Running: seed_ppmp_2026.sql
echo.
echo  Loading PPMP by Division:
echo    ┌──────────┬───────────┬─────────────────────┐
echo    │ Division │   Items   │       Amount        │
echo    ├──────────┼───────────┼─────────────────────┤
echo    │ FAD      │    58     │   P11,285,550.00    │
echo    │ MWPTD    │    16     │      P968,950.00    │
echo    │ MWPSD    │    12     │    P1,364,500.00    │
echo    │ WRSD     │    18     │    P5,969,072.00    │
echo    ├──────────┼───────────┼─────────────────────┤
echo    │ TOTAL    │   104     │   P19,588,072.00    │
echo    └──────────┴───────────┴─────────────────────┘
echo.
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0seed_ppmp_2026.sql"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] PPMP seed failed!
    pause
    exit /b 1
)
echo  [OK] 104 PPMP line items loaded

:: ============================================================================
:: STEP 8: RUN STATUS MIGRATION
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 8 of 10: Running status migration                               │
echo  │  (updating all status values to latest format)                        │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Running: migration_status_update.sql
echo.
echo  Status Formats:
echo    • PR:       pending_approval / approved / rejected / cancelled
echo    • RFQ:      on_going / completed / cancelled
echo    • Abstract: on_going / completed / cancelled
echo    • PostQual: on_going / completed / cancelled
echo    • BAC Res:  on_going / completed / cancelled
echo    • NOA:      awaiting_noa / with_noa / cancelled
echo    • PO:       for_signing / signed / cancelled
echo    • IAR:      inspection_ongoing / inspected_verified / etc.
echo.
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0migration_status_update.sql"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] Status migration failed!
    pause
    exit /b 1
)
echo  [OK] Status migration completed

:: ============================================================================
:: STEP 9: CREATE USER ACCOUNTS
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 9 of 10: Creating user accounts                                 │
echo  │  (10 users with role assignments)                                     │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Running: seed_users.sql
echo.
echo  Creating Users:
echo    ┌────────────────┬──────────────────┬──────────────┐
echo    │ Username       │ Role             │ Division     │
echo    ├────────────────┼──────────────────┼──────────────┤
echo    │ admin          │ admin            │ All          │
echo    │ regienald      │ division_head    │ FAD          │
echo    │ cherryl        │ division_head    │ MWPTD        │
echo    │ marissa        │ division_head    │ MWPSD        │
echo    │ eval           │ div_head+bac_chr │ WRSD         │
echo    │ ritchel.butao  │ hope             │ ORD          │
echo    │ mark           │ supply_officer   │ FAD          │
echo    │ gary           │ supply_officer   │ FAD          │
echo    │ giovanni       │ bac_secretariat  │ FAD          │
echo    │ jomar          │ officer          │ FAD          │
echo    └────────────────┴──────────────────┴──────────────┘
echo.
%PSQL% -U %USER% -p %PORT% -d %DB% -f "%~dp0seed_users.sql"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  [ERROR] User seed failed!
    pause
    exit /b 1
)
echo  [OK] 10 user accounts created

:: ============================================================================
:: STEP 10: VERIFY INSTALLATION
:: ============================================================================
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  STEP 10 of 10: Verifying database setup                              │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  Checking table count...
%PSQL% -U %USER% -p %PORT% -d %DB% -t -c "SELECT 'Tables: ' || COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
echo.
echo  Checking data counts...
%PSQL% -U %USER% -p %PORT% -d %DB% -t -c "SELECT 'Users: ' || COUNT(*) FROM users;"
%PSQL% -U %USER% -p %PORT% -d %DB% -t -c "SELECT 'Employees: ' || COUNT(*) FROM employees;"
%PSQL% -U %USER% -p %PORT% -d %DB% -t -c "SELECT 'Items: ' || COUNT(*) FROM items;"
%PSQL% -U %USER% -p %PORT% -d %DB% -t -c "SELECT 'Suppliers: ' || COUNT(*) FROM suppliers;"
%PSQL% -U %USER% -p %PORT% -d %DB% -t -c "SELECT 'Purchase Orders: ' || COUNT(*) FROM purchaseorders;"
%PSQL% -U %USER% -p %PORT% -d %DB% -t -c "SELECT 'Purchase Requests: ' || COUNT(*) FROM purchaserequests;"
%PSQL% -U %USER% -p %PORT% -d %DB% -t -c "SELECT 'PPMP Items: ' || COUNT(*) FROM procurementplans WHERE ppmp_no IS NOT NULL;"
echo.

:: ============================================================================
:: SETUP COMPLETE
:: ============================================================================
color 0A
echo.
echo --- Data Summary ---
%PSQL% -U %USER% -p %PORT% -d %DB% -c "SELECT 'Items' AS entity, COUNT(*) AS count FROM items UNION ALL SELECT 'Suppliers', COUNT(*) FROM suppliers UNION ALL SELECT 'POs', COUNT(*) FROM purchaseorders UNION ALL SELECT 'PRs', COUNT(*) FROM purchaserequests UNION ALL SELECT 'RFQs', COUNT(*) FROM rfqs UNION ALL SELECT 'Abstracts', COUNT(*) FROM abstracts UNION ALL SELECT 'BAC Resolutions', COUNT(*) FROM bac_resolutions UNION ALL SELECT 'NOAs', COUNT(*) FROM notices_of_award UNION ALL SELECT 'PPMP Items', COUNT(*) FROM procurementplans WHERE ppmp_no IS NOT NULL AND id > 5 UNION ALL SELECT 'IARs', COUNT(*) FROM iars UNION ALL SELECT 'Trip Tickets', COUNT(*) FROM trip_tickets ORDER BY entity;"
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  DATABASE CONNECTION DETAILS                                          │
echo  ├───────────────────────────────────────────────────────────────────────┤
echo  │  Host:      localhost                                                 │
echo  │  Port:      5433                                                      │
echo  │  Database:  dmw_db                                                    │
echo  │  User:      postgres                                                  │
echo  │  Password:  kurt09908                                                 │
echo  │  pgAdmin:   dmw_database (server name)                                │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo  ┌───────────────────────────────────────────────────────────────────────┐
echo  │  LOGIN CREDENTIALS                                                    │
echo  ├───────────────────────────────────────────────────────────────────────┤
echo  │                                                                       │
echo  │  ADMIN ACCOUNT:                                                       │
echo  │    Username: admin                                                    │
echo  │    Password: admin123                                                 │
echo  │                                                                       │
echo  │  OTHER ACCOUNTS: (password: dmw2026)                                  │
echo  │    regienald     - Division Head (FAD)                                │
echo  │    cherryl       - Division Head (MWPTD)                              │
echo  │    marissa       - Division Head (MWPSD)                              │
echo  │    eval          - Division Head + BAC Chair (WRSD)                   │
echo  │    ritchel.butao - HOPE (ORD)                                         │
echo  │    mark          - Supply Officer (FAD)                               │
echo  │    gary          - Supply Officer (FAD)                               │
echo  │    giovanni      - BAC Secretariat (FAD)                              │
echo  │    jomar         - Officer (FAD)                                      │
echo  │                                                                       │
echo  └───────────────────────────────────────────────────────────────────────┘
echo.
echo DATABASE CONNECTION:
echo   Host: localhost
echo   Port: 5432
echo   Database: dmw_database
echo   Server: dmw_database (PostgreSQL 18)
echo   User: postgres
echo   Password: dmw123
echo.
echo  For detailed instructions, see: NEW_SERVER_SETUP_GUIDE.md
echo.
echo  Press any key to exit...
pause >nul

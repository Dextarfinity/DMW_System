# DMW Database Backup — 2026-04-10

## What's Inside

| File | Purpose |
|------|---------|
| `dmw_db_full_backup.sql` | **USE THIS TO RESTORE** — Full database (schema + data) |
| `dmw_db_schema_only.sql` | Table structures only (no data) |
| `dmw_db_data_only.sql` | Data only (INSERT statements, needs schema first) |
| `csv_tables/` | All 55 tables as individual CSV files (for viewing in Excel) |
| `table_summary.csv` | Row counts per table |
| `RESTORE_DATABASE.bat` | Double-click to restore (Windows) |

## How to Restore on a New Laptop

### Prerequisites
1. Install **PostgreSQL 18** (or compatible version)
2. During install, set password for `postgres` user to: `dmw123`
3. Make sure PostgreSQL `bin` folder is in your system PATH

### Option A: Double-click the script
1. Double-click `RESTORE_DATABASE.bat`
2. Type `yes` when prompted
3. Wait for it to finish

### Option B: Manual restore via command line
```bash
# Set password so you don't get prompted
set PGPASSWORD=dmw123

# Drop old database if it exists
dropdb -U postgres -h localhost --if-exists dmw_db

# Create fresh database
createdb -U postgres -h localhost dmw_db

# Restore from backup
psql -U postgres -h localhost -d dmw_db -f dmw_db_full_backup.sql
```

### Option C: Using pgAdmin
1. Open pgAdmin
2. Right-click Databases > Create > Database > Name: `dmw_db`
3. Right-click `dmw_db` > Restore > Select `dmw_db_full_backup.sql`

## Database Info
- **Database name:** `dmw_db`
- **PostgreSQL version:** 18.2
- **Tables:** 55
- **Total backup size:** ~1.4 MB

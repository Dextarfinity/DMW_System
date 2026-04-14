-- Migration: Add bidder_type column to bac_resolutions table
-- Date: 2026-03-26
-- Description: Adds bidder_type column to support different bidder classifications:
--   - LOWEST CALCULATED AND RESPONSIVE (LCRB)
--   - HIGHEST RATED AND RESPONSIVE (HRRB)
--   - MOST ECONOMICALLY ADVANTAGEOUS AND RESPONSIVE (MEARB)
--   - MOST ADVANTAGEOUS AND RESPONSIVE (MARB)

-- Add bidder_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bac_resolutions'
        AND column_name = 'bidder_type'
    ) THEN
        ALTER TABLE bac_resolutions
        ADD COLUMN bidder_type VARCHAR(100) DEFAULT 'LOWEST CALCULATED AND RESPONSIVE (LCRB)';

        RAISE NOTICE 'Column bidder_type added to bac_resolutions table';
    ELSE
        RAISE NOTICE 'Column bidder_type already exists in bac_resolutions table';
    END IF;
END $$;

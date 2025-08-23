-- Migration: Fix bilangan constraint to allow 0 (single participant)
-- Date: 2025-01-23
-- Description: Remove or modify the check_bilangan_positive constraint to allow bilangan = 0

-- First, let's check if the constraint exists and what it does
-- This will show us the current constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'check_bilangan_positive';

-- Option 1: Drop the existing constraint if it exists
-- Uncomment the line below if you want to completely remove the constraint
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_bilangan_positive;

-- Option 2: Modify the constraint to allow 0 (recommended)
-- First drop the old constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_bilangan_positive;

-- Then create a new constraint that allows 0 (single participant)
ALTER TABLE bookings ADD CONSTRAINT check_bilangan_non_negative 
CHECK (bilangan >= 0);

-- Add comment to explain the new constraint
COMMENT ON CONSTRAINT check_bilangan_non_negative ON bookings IS 
'Bilangan peserta tambahan tidak boleh negatif. Nilai 0 berarti hanya pendaftar saja yang akan pergi.';

-- Verify the constraint was created
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'check_bilangan_non_negative';

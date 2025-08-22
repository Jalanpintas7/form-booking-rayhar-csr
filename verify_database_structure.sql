-- Verify Database Structure for Checkbox Issue
-- Run this in Supabase SQL Editor to check the current state

-- 1. Check if the checkbox columns exist in members_booking table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    CASE 
        WHEN column_name IN ('cwb', 'infant', 'cnb') THEN 'CHECKBOX COLUMN'
        ELSE 'OTHER COLUMN'
    END as column_type
FROM information_schema.columns 
WHERE table_name = 'members_booking' 
ORDER BY ordinal_position;

-- 2. Check the structure of the bookings table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

-- 3. Check recent data in members_booking to see if checkbox data is being saved
SELECT 
    id,
    booking_id,
    nama,
    cwb,
    infant,
    cnb,
    created_at
FROM members_booking 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check if there are any recent bookings
SELECT 
    id,
    nama,
    bilangan,
    created_at
FROM bookings 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check the relationship between bookings and members_booking
SELECT 
    b.id as booking_id,
    b.nama as booking_nama,
    b.bilangan,
    COUNT(mb.id) as actual_members_count,
    ARRAY_AGG(mb.nama) as member_names,
    ARRAY_AGG(mb.cwb) as cwb_values,
    ARRAY_AGG(mb.infant) as infant_values,
    ARRAY_AGG(mb.cnb) as cnb_values
FROM bookings b
LEFT JOIN members_booking mb ON b.id = mb.booking_id
GROUP BY b.id, b.nama, b.bilangan
ORDER BY b.created_at DESC
LIMIT 10;

-- 6. Check for any foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('bookings', 'members_booking');

-- Migration: Add checkbox columns to members_booking table
-- Date: 2024-12-19
-- Description: Add CWB, Infant, and CNB checkbox columns to store participant categories

-- Add the new columns to members_booking table
ALTER TABLE members_booking 
ADD COLUMN cwb BOOLEAN DEFAULT FALSE,
ADD COLUMN infant BOOLEAN DEFAULT FALSE,
ADD COLUMN cnb BOOLEAN DEFAULT FALSE;

-- Add comments to document the purpose of these columns
COMMENT ON COLUMN members_booking.cwb IS 'Child with Bag - indicates if participant is a child with luggage';
COMMENT ON COLUMN members_booking.infant IS 'Infant - indicates if participant is an infant';
COMMENT ON COLUMN members_booking.cnb IS 'Child No Bag - indicates if participant is a child without luggage';

-- Create indexes for better query performance (optional)
CREATE INDEX idx_members_booking_cwb ON members_booking(cwb);
CREATE INDEX idx_members_booking_infant ON members_booking(infant);
CREATE INDEX idx_members_booking_cnb ON members_booking(cnb);

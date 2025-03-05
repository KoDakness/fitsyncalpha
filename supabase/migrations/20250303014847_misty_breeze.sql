/*
  # Add height column to users table

  1. Changes
    - Add height column to users table to store user height in cm
*/

-- Add height column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'height'
  ) THEN
    ALTER TABLE users ADD COLUMN height NUMERIC(5,1);
  END IF;
END $$;
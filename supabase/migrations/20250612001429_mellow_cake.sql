/*
  # Remove all Twilio traces from database

  1. Database Changes
    - Remove `twilio_sid` column from messages table
    - Remove `twilio_sid` index
    - Clean up any Twilio-related constraints or references

  2. Security
    - No RLS changes needed (column removal only)

  3. Notes
    - This is safe for new apps with no existing data
    - Vonage integration uses `vonage_id` column instead
*/

-- Remove the twilio_sid column completely
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'twilio_sid'
  ) THEN
    -- Drop the index first
    DROP INDEX IF EXISTS messages_twilio_sid_idx;
    
    -- Remove the column
    ALTER TABLE messages DROP COLUMN twilio_sid;
    
    RAISE NOTICE 'Removed twilio_sid column and index from messages table';
  ELSE
    RAISE NOTICE 'twilio_sid column does not exist, nothing to remove';
  END IF;
END $$;
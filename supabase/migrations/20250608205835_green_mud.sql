/*
  # Add Twilio SID tracking to messages table

  1. Changes
    - Add `twilio_sid` column to track Twilio message/call IDs
    - This helps with delivery status tracking and debugging

  2. Security
    - No changes to RLS policies needed
    - Column is optional and for internal tracking only
*/

-- Add Twilio SID column for tracking sent messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'twilio_sid'
  ) THEN
    ALTER TABLE messages ADD COLUMN twilio_sid text;
  END IF;
END $$;

-- Add index for Twilio SID lookups
CREATE INDEX IF NOT EXISTS messages_twilio_sid_idx ON messages(twilio_sid);
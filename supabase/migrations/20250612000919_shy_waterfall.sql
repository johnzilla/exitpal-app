/*
  # Add Vonage ID tracking to messages table

  1. Schema Changes
    - Add `vonage_id` column to `messages` table
    - This will store Vonage message IDs and call UUIDs for tracking
    - Column is nullable since existing messages won't have Vonage IDs

  2. Index
    - Add index on `vonage_id` for efficient lookups

  3. Notes
    - This migration is safe and non-destructive
    - Existing data will remain unchanged
    - New messages will populate this field when sent via Vonage
*/

-- Add vonage_id column to messages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'vonage_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN vonage_id text;
  END IF;
END $$;

-- Add index for efficient lookups
CREATE INDEX IF NOT EXISTS messages_vonage_id_idx ON messages(vonage_id);

-- Update the existing twilio_sid column comment for clarity (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'twilio_sid'
  ) THEN
    COMMENT ON COLUMN messages.twilio_sid IS 'Legacy Twilio SID - replaced by vonage_id';
  END IF;
END $$;
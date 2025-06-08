/*
  # Create messages table with safe policy creation

  1. New Tables
    - `messages`
      - `id` (uuid, primary key) - Message identifier
      - `user_id` (uuid, foreign key) - References profiles.id
      - `contact_name` (text) - Display name for contact
      - `message_content` (text) - Message body content
      - `phone_number` (text) - Recipient phone number
      - `scheduled_time` (timestamp) - When to send message
      - `message_type` (enum) - 'sms' or 'voice'
      - `status` (enum) - 'pending', 'sent', or 'failed'
      - `created_at` (timestamp) - Message creation time

  2. Security
    - Enable RLS on `messages` table
    - Add policies for authenticated users to manage their own messages
    - Safe policy creation that won't fail if policies already exist

  3. Performance
    - Add indexes for user_id, scheduled_time, and status columns
*/

-- Create enums for message types and statuses (safe creation)
DO $$ 
BEGIN
  CREATE TYPE message_type AS ENUM ('sms', 'voice');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ 
BEGIN
  CREATE TYPE message_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create the messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  message_content text NOT NULL,
  phone_number text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  message_type message_type NOT NULL DEFAULT 'sms',
  status message_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DO $$ 
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Users can read own messages" ON messages;
  DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
  DROP POLICY IF EXISTS "Users can update own messages" ON messages;
  DROP POLICY IF EXISTS "Users can delete own messages" ON messages;
  
  -- Create policies
  CREATE POLICY "Users can read own messages"
    ON messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own messages"
    ON messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own messages"
    ON messages
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete own messages"
    ON messages
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
    
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies: %', SQLERRM;
END $$;

-- Add indexes for better performance (safe creation)
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_scheduled_time_idx ON messages(scheduled_time);
CREATE INDEX IF NOT EXISTS messages_status_idx ON messages(status);
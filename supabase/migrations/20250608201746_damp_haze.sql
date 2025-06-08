/*
  # Create scheduled messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key) - Unique message identifier
      - `user_id` (uuid, foreign key) - References profiles.id
      - `contact_name` (text) - Display name for the contact
      - `message_content` (text) - The message body/content
      - `phone_number` (text) - Recipient phone number
      - `scheduled_time` (timestamp) - When to send the message
      - `message_type` (enum) - 'sms' or 'voice'
      - `status` (enum) - 'pending', 'sent', or 'failed'
      - `created_at` (timestamp) - When the message was scheduled

  2. Security
    - Enable RLS on `messages` table
    - Add policies for users to manage their own messages
    - Add indexes for performance

  3. Enums
    - Create message_type enum
    - Create message_status enum
*/

-- Create enums for message types and statuses
DO $$ BEGIN
  CREATE TYPE message_type AS ENUM ('sms', 'voice');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE message_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

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

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own messages
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own messages
CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own messages
CREATE POLICY "Users can update own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own messages
CREATE POLICY "Users can delete own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages(user_id);
CREATE INDEX IF NOT EXISTS messages_scheduled_time_idx ON messages(scheduled_time);
CREATE INDEX IF NOT EXISTS messages_status_idx ON messages(status);
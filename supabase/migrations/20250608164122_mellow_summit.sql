/*
  # Initial Schema Setup for ExitPal

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
    - `scheduled_messages` - All scheduled SMS and voice messages
    - `twilio_numbers` - Available Twilio phone numbers for premium users

  2. Security
    - Enable RLS on all tables
    - Add policies for user data isolation
    - Secure access patterns for premium features

  3. Features
    - User profiles with premium status
    - Message scheduling and status tracking
    - Premium phone number management
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  is_premium boolean DEFAULT false,
  selected_twilio_number_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scheduled_messages table
CREATE TABLE IF NOT EXISTS scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contact_name text NOT NULL,
  message_content text NOT NULL,
  phone_number text NOT NULL,
  scheduled_time timestamptz NOT NULL,
  message_type text NOT NULL CHECK (message_type IN ('sms', 'voice')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  twilio_message_id text,
  from_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create twilio_numbers table for premium features
CREATE TABLE IF NOT EXISTS twilio_numbers (
  id text PRIMARY KEY,
  phone_number text NOT NULL UNIQUE,
  label text NOT NULL,
  is_premium boolean DEFAULT true,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default Twilio numbers
INSERT INTO twilio_numbers (id, phone_number, label, is_premium, is_available) VALUES
  ('default', '+12312345678', 'Default ExitPal Number', false, true),
  ('michigan', '+12313456789', 'Michigan (231)', true, true),
  ('tollfree', '+18005551234', 'Toll Free (800)', true, true),
  ('newyork', '+12125551234', 'New York (212)', true, true),
  ('losangeles', '+13105551234', 'Los Angeles (310)', true, true),
  ('chicago', '+13125551234', 'Chicago (312)', true, true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE twilio_numbers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Scheduled messages policies
CREATE POLICY "Users can read own messages"
  ON scheduled_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON scheduled_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON scheduled_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON scheduled_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Twilio numbers policies (read-only for users)
CREATE POLICY "Anyone can read available numbers"
  ON twilio_numbers
  FOR SELECT
  TO authenticated
  USING (is_available = true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_messages_updated_at
  BEFORE UPDATE ON scheduled_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
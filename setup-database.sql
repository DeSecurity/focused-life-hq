-- Create the user_data table
CREATE TABLE IF NOT EXISTS user_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own data
CREATE POLICY "Users can read their own data"
  ON user_data
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a policy that allows users to insert their own data
CREATE POLICY "Users can insert their own data"
  ON user_data
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to update their own data
CREATE POLICY "Users can update their own data"
  ON user_data
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a policy that allows users to delete their own data
CREATE POLICY "Users can delete their own data"
  ON user_data
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON user_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


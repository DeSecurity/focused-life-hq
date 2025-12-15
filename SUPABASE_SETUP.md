# Supabase Setup Instructions

This document outlines what you need to do on your Supabase backend to get the application working.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Fill in your project details:
   - Name: `focused-life-hq` (or your preferred name)
   - Database Password: Choose a strong password (save this!)
   - Region: Choose the closest region to your users
4. Wait for the project to be created (takes a few minutes)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `VITE_SUPABASE_URL`)
   - **anon/public key** (this is your `VITE_SUPABASE_ANON_KEY`)

## 3. Create the Database Table

You need to create a table to store user data. Run this SQL in the Supabase SQL Editor:

```sql
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
```

## 4. Enable Google OAuth (Optional but Recommended)

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find **Google** in the list and click on it
3. Enable Google OAuth
4. You'll need to:
   - Create a Google OAuth application in the [Google Cloud Console](https://console.cloud.google.com/)
   - Get your **Client ID** and **Client Secret**
   - Add your Supabase redirect URL to the authorized redirect URIs:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
   - Enter these credentials in Supabase
5. Save the changes

## 5. Configure Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. **Important for Development**: 
   - Go to **Authentication** → **Settings** → **Auth Providers**
   - Under **Email Auth**, you can toggle **"Enable email confirmations"**
   - For development/testing, you may want to **disable email confirmations** so users can sign in immediately after signup
   - For production, you should **enable email confirmations** for security
4. Configure email templates if desired (optional)
5. For development, you can use Supabase's built-in email service
6. For production, consider setting up a custom SMTP server

## 6. Set Up Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Important**: Never commit your `.env` file to version control. It should already be in `.gitignore`

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Try signing up with email/password
3. Try signing in with Google (if configured)
4. Create some data (tasks, projects, etc.)
5. Refresh the page - your data should persist!

## Troubleshooting

### "Invalid API key" error
- Make sure you're using the **anon/public** key, not the service_role key
- Check that your `.env` file is in the project root
- Restart your dev server after changing `.env` files

### "Row Level Security" errors
- Make sure you've run all the SQL commands above
- Check that RLS policies are created correctly
- Verify that the user is authenticated (check `auth.uid()`)

### Google OAuth not working
- Verify your redirect URI matches exactly
- Check that Google OAuth is enabled in Supabase
- Make sure your Google Cloud Console credentials are correct

### Data not persisting
- Check the browser console for errors
- Verify the `user_data` table exists and has the correct structure
- Check Supabase logs in the dashboard under **Logs** → **Postgres Logs**

## Next Steps

Once everything is set up:
1. Your app will automatically sync data to Supabase
2. Users can access their data from any device
3. Data is securely stored and backed up
4. You can add more features like real-time collaboration, sharing, etc.

For more information, check the [Supabase documentation](https://supabase.com/docs).


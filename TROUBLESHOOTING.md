# Troubleshooting Guide

## Signup Spins Forever / Can't Login After Signup

### Issue: Email Confirmation Required

By default, Supabase requires users to confirm their email before they can sign in. This means:
- After signup, you'll see "Account created! Please check your email..."
- You need to click the confirmation link in your email
- Only then can you sign in

**Solution for Development:**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings** → **Auth Providers**
3. Under **Email Auth**, toggle **OFF** "Enable email confirmations"
4. Save the changes
5. Now users can sign in immediately after signup

**For Production:**
- Keep email confirmations enabled for security
- Make sure your email service is properly configured

### Issue: Session Not Persisting

If you can sign up but can't stay logged in after refresh:

1. **Check Browser Console** for errors:
   - Open DevTools (F12)
   - Look for red errors
   - Check the Network tab for failed requests

2. **Verify Environment Variables:**
   ```javascript
   // In browser console:
   console.log(import.meta.env.VITE_SUPABASE_URL)
   console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
   ```
   Both should show your values (not undefined)

3. **Check Supabase Client:**
   ```javascript
   // In browser console:
   testSupabase()
   ```
   This will test your connection and show any errors

4. **Clear Browser Storage:**
   - Open DevTools → Application → Storage
   - Clear Local Storage and Session Storage
   - Try signing in again

### Issue: "Invalid API key" Error

- Make sure you're using the **anon/public** key, not the service_role key
- Check that your `.env` file is in the project root
- Restart your dev server after changing `.env`

### Issue: Database Errors

If you see errors about the `user_data` table:
- Make sure you've run the SQL setup from `SUPABASE_SETUP.md`
- Check that Row Level Security (RLS) policies are created
- Verify the table exists in your Supabase dashboard

### Debugging Tips

1. **Enable Console Logging:**
   - The app now logs authentication events to the console
   - Look for messages starting with 🔐, ✅, ❌, or ⚠️

2. **Check Supabase Dashboard:**
   - Go to **Authentication** → **Users** to see if your user was created
   - Check **Logs** → **Postgres Logs** for database errors
   - Check **Logs** → **Auth Logs** for authentication errors

3. **Test Supabase Connection:**
   ```javascript
   // In browser console:
   testSupabase()
   ```

4. **Check Network Requests:**
   - Open DevTools → Network tab
   - Try signing up/login
   - Look for failed requests (red)
   - Check the response for error messages

### Common Error Messages

**"User already registered"**
- The email is already in use
- Try signing in instead, or use a different email

**"Invalid login credentials"**
- Wrong email or password
- Or email not confirmed (if confirmations are enabled)

**"Failed to fetch"**
- Network error or Supabase URL is wrong
- Check your `VITE_SUPABASE_URL` in `.env`

**"relation 'user_data' does not exist"**
- You haven't run the database setup SQL yet
- See `SUPABASE_SETUP.md` step 3


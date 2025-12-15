# GitHub Pages Deployment Setup

## Prerequisites

1. Your repository must have GitHub Pages enabled
2. You need to set up GitHub Secrets for your Supabase credentials

## Step 1: Set Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

4. Click **New repository secret** again and add:

   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon/public key

## Step 2: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select:
   - **Source**: `GitHub Actions` (not "Deploy from a branch")
3. Save

## Step 3: Deploy

1. Push your code to the `main` branch
2. The GitHub Actions workflow will automatically:
   - Build your app with the environment variables
   - Deploy to GitHub Pages
3. Your app will be available at: `https://[your-username].github.io/focused-life-hq/`

## Troubleshooting

### Black Screen / Blank Page

1. **Check browser console** (F12) for errors
2. **Verify environment variables** are set in GitHub Secrets
3. **Check the build logs** in GitHub Actions to see if the build succeeded
4. **Verify the base path** matches your repository name in `vite.config.ts`

### Environment Variables Not Working

- Make sure secrets are named exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- The `VITE_` prefix is required for Vite to expose them to the client
- After adding secrets, you need to trigger a new build (push a commit)

### Routing Issues

- The app uses `basename={import.meta.env.BASE_URL}` in BrowserRouter
- Make sure `vite.config.ts` has `base: "/focused-life-hq/"` matching your repo name
- All routes will automatically work with the base path

### OAuth Redirects Not Working

- Make sure your Supabase redirect URLs include the GitHub Pages URL:
  - Go to Supabase Dashboard → Authentication → URL Configuration
  - Add: `https://[your-username].github.io/focused-life-hq/auth/callback`
  - Also add for Google OAuth if using it

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. Build locally:
   ```bash
   npm run build
   ```

2. Copy the `dist` folder contents to the `gh-pages` branch
3. Push to GitHub

However, using GitHub Actions (as configured) is recommended as it automatically handles environment variables and deployment.


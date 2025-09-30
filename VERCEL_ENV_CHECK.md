# Vercel Environment Variables Check

## ⚠️ Required for Performance Monitoring

The performance monitoring feature requires the **Supabase Service Role Key** to bypass RLS policies.

### Check if Variable is Set

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project: **sch-pro-next**
3. Go to **Settings** → **Environment Variables**
4. Look for: `SUPABASE_SERVICE_ROLE_KEY`

### If Missing, Add It:

1. Get the key from Supabase:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to **Settings** → **API**
   - Copy the **`service_role`** key (NOT the anon key)

2. Add to Vercel:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbG...` (paste the service_role key)
   - Environment: Select **Production**, **Preview**, **Development**
   - Click **Save**

3. **Redeploy** the application:
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **Redeploy**

### Security Note

⚠️ The service_role key **bypasses Row Level Security** - keep it secure!
- Never commit it to git
- Only use it in server-side code
- Store it only in Vercel environment variables
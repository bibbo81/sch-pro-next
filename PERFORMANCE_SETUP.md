# Performance Monitoring Setup

## Database Migration Required

The Performance Monitoring feature requires new database tables. You need to run the migration in Supabase.

### Steps to Enable Performance Monitoring:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Run the Migration**
   - Copy the content of `/supabase/migrations/20250929_performance_monitoring.sql`
   - Paste it into the SQL Editor
   - Click "Run" button

4. **Verify Tables Created**
   - Go to "Table Editor"
   - Verify these tables exist:
     - `api_performance_logs`
     - `system_metrics`
     - `performance_summary`

### Environment Variables

Make sure you have the service role key configured:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find it in Supabase Dashboard → Settings → API → service_role key

### Usage

Once the migration is complete:

1. Go to `/super-admin/performance`
2. View real-time performance metrics
3. Monitor API response times, error rates, and slow queries

### How it Works

- **Automatic Logging**: API calls are logged to `api_performance_logs` table
- **Metrics Calculation**: Response times, error rates, and percentiles are calculated in real-time
- **Data Retention**: Logs older than 30 days are automatically cleaned (requires pg_cron extension)

### Manual Logging (Optional)

To manually log performance data from your API routes, use:

```typescript
await fetch('/api/super-admin/performance/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    endpoint: '/api/your-endpoint',
    method: 'GET',
    statusCode: 200,
    responseTime: 145,
    userId: 'user-id',
    organizationId: 'org-id',
    errorMessage: null
  })
})
```

### Dashboard Features

- **Summary Cards**: Total requests, error rate, avg response time, slowest request
- **Time Series Charts**: Requests/errors over time, response time trends
- **Endpoint Breakdown**: Top endpoints by traffic with statistics
- **Slow Query Detection**: Automatically highlights queries > 1000ms
- **Time Range Filters**: 1h, 24h, 7d, 30d

### Troubleshooting

**No data showing?**
- Make sure the migration has been run
- Verify the service role key is configured
- Check that API calls are being logged

**Slow performance?**
- The dashboard queries up to 1000 records at a time
- Consider adding more indexes if querying is slow
- Run the cleanup function to remove old data

**Permission errors?**
- Ensure the user has `is_super_admin = true` in user metadata
- Verify RLS policies are correctly applied
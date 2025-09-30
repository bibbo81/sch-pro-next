# 📋 Applicare Migration Analytics

## Step 1: Aprire Supabase SQL Editor

1. Vai su: https://supabase.com/dashboard/project/vgwlnsycdohrfmrfjprl/sql/new
2. Copia TUTTO il contenuto del file: `supabase/migrations/20250930_analytics_reporting.sql`
3. Incollalo nell'editor SQL
4. Clicca "Run" o premi `Cmd/Ctrl + Enter`

## Step 2: Verificare Creazione Tabelle

Esegui questo query per verificare:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'analytics_metrics',
  'scheduled_reports',
  'report_history',
  'custom_dashboards',
  'dashboard_widgets'
)
ORDER BY table_name;
```

Dovresti vedere tutte e 5 le tabelle.

## Step 3: Verifica Funzioni

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('calculate_organization_metrics', 'get_trending_metrics');
```

Dovresti vedere 2 funzioni.

## ✅ Quando hai finito

Torna qui e dimmi "fatto" così continuo con il codice!

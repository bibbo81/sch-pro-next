# Phase 6 Database Migration - Chunks

Migration suddivisa in 6 parti per facilitare l'applicazione via Supabase Dashboard.

## Come applicare

### Metodo 1: Supabase Dashboard (CONSIGLIATO)

1. Vai su **https://supabase.com/dashboard**
2. Seleziona il tuo progetto
3. Click su **SQL Editor** (menu laterale)
4. Click su **"New query"**

Poi applica i chunk **in ordine**:

#### Chunk 1/6: Tabella tracking_providers
```sql
-- Copia/incolla il contenuto di: 01_create_tracking_providers_table.sql
```
✅ Click **"Run"** e verifica: `Success. No rows returned`

#### Chunk 2/6: Tabella tracking_requests_log
```sql
-- Copia/incolla il contenuto di: 02_create_tracking_requests_log_table.sql
```
✅ Click **"Run"** e verifica: `Success. No rows returned`

#### Chunk 3/6: Aggiorna tabella trackings
```sql
-- Copia/incolla il contenuto di: 03_alter_trackings_table.sql
```
✅ Click **"Run"** e verifica: `Success. No rows returned`

#### Chunk 4/6: RLS Policies
```sql
-- Copia/incolla il contenuto di: 04_rls_policies.sql
```
✅ Click **"Run"** e verifica: `Success. No rows returned`

#### Chunk 5/6: Seed Providers (11 carriers + JSONCargo + ShipsGo)
```sql
-- Copia/incolla il contenuto di: 05_seed_providers.sql
```
✅ Click **"Run"** e verifica: `13 rows inserted` oppure `Success`

#### Chunk 6/6: Helper Functions & Triggers
```sql
-- Copia/incolla il contenuto di: 06_helper_functions.sql
```
✅ Click **"Run"** e verifica: `Success. No rows returned`

---

## Verifica installazione

Dopo aver applicato tutti i chunk, esegui questa query per verificare:

```sql
-- Verifica tabelle create
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('tracking_providers', 'tracking_requests_log');

-- Verifica providers inseriti
SELECT name, provider, priority, is_active
FROM tracking_providers
ORDER BY priority, name;

-- Verifica funzioni create
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_best_tracking_provider', 'log_tracking_request', 'update_provider_stats');
```

**Output atteso:**
- 2 tabelle: `tracking_providers`, `tracking_requests_log`
- 13 providers: 11 scrapers + 1 JSONCargo + 1 ShipsGo
- 3 funzioni: `get_best_tracking_provider`, `log_tracking_request`, `update_provider_stats`

---

## Troubleshooting

### Errore: "relation already exists"
- ✅ **OK!** Significa che la tabella è già stata creata. Puoi passare al chunk successivo.

### Errore: "permission denied"
- Assicurati di essere connesso con il ruolo `postgres` o `service_role`
- Verifica che i GRANT statements siano stati eseguiti

### Errore: "column already exists"
- ✅ **OK!** Significa che la colonna è già stata aggiunta. Continua con il prossimo chunk.

### Errore: "policy already exists"
- Puoi eliminare la policy esistente e ricrearla:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```

---

## Rollback (se necessario)

Se vuoi annullare la migration:

```sql
-- ATTENZIONE: Questo eliminerà tutti i dati!
DROP TRIGGER IF EXISTS trigger_update_provider_stats ON tracking_requests_log;
DROP FUNCTION IF EXISTS update_provider_stats();
DROP FUNCTION IF EXISTS log_tracking_request();
DROP FUNCTION IF EXISTS get_best_tracking_provider();
DROP TABLE IF EXISTS tracking_requests_log CASCADE;
DROP TABLE IF EXISTS tracking_providers CASCADE;

ALTER TABLE trackings DROP COLUMN IF EXISTS provider_used;
ALTER TABLE trackings DROP COLUMN IF EXISTS tracking_type;
ALTER TABLE trackings DROP COLUMN IF EXISTS raw_data;
ALTER TABLE trackings DROP COLUMN IF EXISTS last_provider_sync;
```

---

## Next Steps

Dopo aver applicato la migration:

1. ✅ Vai su http://localhost:3000/dashboard/test-tracking
2. ✅ Testa con tracking number MSC: `MSCU1234567`
3. ✅ Verifica che l'orchestrator funzioni correttamente
4. 🚀 Implementa gli altri scrapers (Maersk, CMA CGM, ecc.)

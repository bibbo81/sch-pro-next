# 🧪 Phase 1.3 - Database Health & Backup Testing

*Data: 30 Settembre 2025*

## 📋 Panoramica

Phase 1.3 aggiunge monitoring avanzato della salute del database PostgreSQL:
- **Connection Pool Monitoring** - Tracking connessioni attive/idle
- **Cache Hit Ratio** - Performance cache database (target > 99%)
- **Table Statistics** - Analisi accessi tabelle (sequential vs index scans)
- **Index Usage** - Efficienza utilizzo indici
- **Long Running Queries** - Query che durano > 30 secondi
- **Deadlock Detection** - Monitoring deadlock
- **Vacuum Statistics** - Status maintenance tabelle
- **Data Integrity Checks** - Verifica record orfani

---

## 🚀 STEP 1: Applica Migration SQL

### 1.1 Apri Supabase Dashboard

1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona progetto `sch-pro-next`
3. Clicca su **SQL Editor** nel menu laterale

### 1.2 Esegui la Migration

1. Apri file: `/supabase/migrations/20250930_database_health.sql`
2. Copia **TUTTO** il contenuto (è lungo!)
3. Incolla in Supabase SQL Editor
4. Clicca **RUN** (▶️)

**⚠️ IMPORTANTE:** Questa migration crea 8 function PostgreSQL:
- `get_connection_stats()` - Statistiche connessioni
- `get_cache_hit_ratio()` - Cache hit ratio
- `get_table_statistics()` - Statistiche tabelle
- `get_index_usage()` - Utilizzo indici
- `get_long_running_queries()` - Query lunghe
- `get_deadlock_info()` - Info deadlock
- `get_vacuum_stats()` - Statistiche vacuum
- `check_data_integrity()` - Controlli integrità

### 1.3 Verifica che le Function siano Create

Esegui questa query in Supabase SQL Editor:

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_connection_stats',
    'get_cache_hit_ratio',
    'get_table_statistics',
    'get_index_usage',
    'get_long_running_queries',
    'get_deadlock_info',
    'get_vacuum_stats',
    'check_data_integrity'
  )
ORDER BY routine_name;
```

**Risultato atteso:** 8 righe, tutte con `routine_type = 'FUNCTION'`

---

## 🚀 STEP 2: Deploy su Vercel

```bash
# Verifica i file modificati
git status

# Aggiungi tutti i file
git add .

# Commit
git commit -m "Add Phase 1.3: Database Health & Backup monitoring"

# Push
git push origin main
```

**Attendi che Vercel completi il deploy** (Status: Ready ✅)

---

## 🧪 STEP 3: Test Database Health Dashboard

### 3.1 Accedi come Super Admin

1. Vai su: `https://your-domain.vercel.app/login`
2. Login con credenziali super-admin
3. Vai su: `https://your-domain.vercel.app/super-admin`

### 3.2 Apri Database Health

1. Clicca su **"Database Health"** (nuovo pulsante!)
2. O vai direttamente: `https://your-domain.vercel.app/super-admin/database-health`

### 3.3 Verifica Dashboard

**Dovresti vedere 4 card in alto:**

#### 1️⃣ **Connections**
- Total: X / Y (es. "5 / 100")
- Usage %: XX% (es. "5%")
- Active: numero connessioni attive
- Idle: numero connessioni idle

**✅ Test:**
- Il numero totale dovrebbe essere > 0
- Usage % dovrebbe essere < 50% (in condizioni normali)
- Se > 80%, badge diventa rosso (warning)

#### 2️⃣ **Cache Hit Ratio**
- Percentuale: XX.XX% (es. "99.45%")
- Target: > 99%
- Badge status: Excellent / Good / Fair / Poor

**✅ Test:**
- Ratio dovrebbe essere > 95% (Good)
- Se > 99%, badge verde "Excellent"
- Se < 90%, badge giallo "Fair"
- Se < 80%, badge rosso "Poor"

#### 3️⃣ **Long Queries**
- Count: numero query > 30 secondi
- Status: Healthy (0) / Warning (> 0)

**✅ Test:**
- Normalmente dovrebbe essere 0 (badge verde "Healthy")
- Se > 0, vedrai lista query sotto con dettagli

#### 4️⃣ **Deadlocks**
- Total: numero deadlock da database start
- Status: Healthy / Warning / Critical

**✅ Test:**
- Idealmente 0 (badge verde "Healthy")
- Se > 0 ma < 10, badge giallo "Warning"
- Se > 10, badge rosso "Critical"

---

### 3.4 Test Tabelle e Sezioni

#### **Table Access Statistics**

**Dovresti vedere:**
- Top 10 tabelle più accessate
- Colonne: Table, Seq Scans, Index Scans, Live Rows, Dead Rows, Efficiency

**✅ Test da fare:**

1. **Verifica Efficiency Score:**
   - Tabelle con molti index scans = efficiency alta (>80%)
   - Badge verde se efficiency > 80%
   - Badge grigio se efficiency < 80%

2. **Verifica Sequential Scans:**
   - Se una tabella ha tantissimi sequential scans = potrebbe servire un indice
   - Es: `shipments` con 10,000 seq scans e 100 index scans = problema!

3. **Verifica Dead Rows:**
   - Dead tuples dovrebbero essere poche (< 10% di live)
   - Se molte, tabella necessita vacuum

**Esempio buono:**
```
shipments:
- Seq Scans: 150
- Index Scans: 5,420
- Efficiency: 97% ✅
```

**Esempio da ottimizzare:**
```
products:
- Seq Scans: 8,900
- Index Scans: 250
- Efficiency: 3% ⚠️ (serve un indice!)
```

---

#### **Index Usage Analysis**

**Dovresti vedere:**
- Top 10 indici meno utilizzati
- Colonne: Index Name, Table, Scans, Size (MB), Status

**✅ Test da fare:**

1. **Cerca indici "unused" (badge rosso):**
   - Scans = 0
   - Occupano spazio ma non vengono usati
   - Candidati per rimozione

2. **Cerca indici "rarely_used" (badge grigio):**
   - Scans < 100
   - Potenzialmente inutili

3. **Verifica size:**
   - Indici grandi (> 10 MB) inutilizzati = spreco di storage

**Esempio problema:**
```
idx_products_legacy:
- Scans: 0
- Size: 15.3 MB
- Status: unused ❌ (rimuovere!)
```

---

#### **Long Running Queries** (se presenti)

**Se count > 0, vedrai:**
- Card gialla con warning
- Lista query con:
  - PID (process ID)
  - Duration in secondi
  - Query SQL (primi 200 caratteri)
  - User e timestamp

**✅ Test da fare:**

1. **Identifica query lente:**
   - Durata > 60s = problema serio
   - Guarda il SQL per capire cosa fa

2. **Azioni possibili:**
   - Ottimizzare la query
   - Aggiungere indice
   - In casi critici, killare il processo

**Come generare una long query per test:**
```sql
-- Esegui in Supabase SQL Editor per test
SELECT pg_sleep(35); -- Dura 35 secondi
```
Poi ricarica il dashboard → dovresti vedere la query nella lista!

---

#### **Vacuum & Analyze Status**

**Dovresti vedere:**
- Top 10 tabelle per dead tuples
- Colonne: Table, Dead Tuples, Dead %, Last Vacuum, Status

**✅ Test da fare:**

1. **Verifica Dead Tuple Ratio:**
   - < 10% = Healthy (badge verde)
   - 10-20% = Warning (badge giallo)
   - > 20% = Needs Vacuum (badge giallo)

2. **Verifica Last Vacuum:**
   - Dovrebbe essere recente (< 7 giorni)
   - Se "Never" = possibile problema

3. **Badge "Needs Vacuum":**
   - Se presente, tabella ha > 1000 dead tuples E ratio > 10%
   - PostgreSQL farà auto-vacuum automaticamente

**Esempio sano:**
```
shipments:
- Dead Tuples: 45
- Dead %: 2.3%
- Last Vacuum: 2025-09-28
- Status: Healthy ✅
```

**Esempio da monitorare:**
```
api_performance_logs:
- Dead Tuples: 8,420
- Dead %: 15.7%
- Last Vacuum: 2025-09-25
- Status: Needs Vacuum ⚠️
```

---

## 🧪 STEP 4: Test Scenari Specifici

### Scenario 1: Cache Hit Ratio Basso

**Come simulare:**
Difficile simulare in production, ma se vedi ratio < 99%:

**Possibili cause:**
- Database troppo piccolo per working set
- Query inefficienti che leggono troppi dati
- Memoria condivisa insufficiente

**Cosa fare:**
- Ottimizzare query lente
- Aggiungere indici
- (Supabase gestisce la memoria automaticamente)

---

### Scenario 2: Troppe Connessioni

**Come simulare:**
Apri 20+ tab del dashboard contemporaneamente

**Risultato atteso:**
- Connection count aumenta
- Usage % sale
- Se > 80%, ricevi warning visivo

**Cosa fare:**
- Chiudere connessioni inutilizzate
- Implementare connection pooling migliore
- Verificare che l'app chiuda correttamente le connessioni

---

### Scenario 3: Query Lenta

**Come simulare:**
```sql
-- In Supabase SQL Editor
SELECT pg_sleep(40);
```

**Poi:**
1. Vai su Database Health dashboard
2. Clicca Refresh
3. Dovresti vedere la query in "Long Running Queries"

**Risultato atteso:**
- Count > 0
- Card gialla con warning
- Query visibile con PID e duration

---

### Scenario 4: Dead Tuples Accumulate

**Come simulare:**
```sql
-- Inserisci e cancella molti record
INSERT INTO api_performance_logs (endpoint, method, status_code, response_time_ms)
SELECT '/test', 'GET', 200, 100
FROM generate_series(1, 1000);

DELETE FROM api_performance_logs WHERE endpoint = '/test';
```

**Poi:**
1. Refresh dashboard
2. Vai su "Vacuum & Analyze Status"
3. Dovresti vedere `api_performance_logs` con molti dead tuples

**Risultato atteso:**
- Dead Tuples count alto
- Dead % aumentato
- Badge "Needs Vacuum" (se > 10%)

**Cosa fare:**
- PostgreSQL farà auto-vacuum automaticamente
- Oppure manuale: `VACUUM ANALYZE api_performance_logs;`

---

## 🧪 STEP 5: Test API Dirette

### Test Connection Stats

```bash
curl https://your-domain.vercel.app/api/super-admin/database-health \
  -H "Cookie: your-session-cookie"
```

**Risultato atteso (JSON):**
```json
{
  "connectionStats": {
    "total": 5,
    "active": 2,
    "idle": 3,
    "max_connections": 100,
    "usage_percentage": 5
  },
  "cacheHitRatio": {
    "cache_hit_ratio": 99.45,
    "status": "excellent"
  },
  ...
}
```

### Test Data Integrity

```bash
curl https://your-domain.vercel.app/api/super-admin/data-integrity \
  -H "Cookie: your-session-cookie"
```

**Risultato atteso:**
```json
{
  "foreign_key_violations": 0,
  "orphaned_records": 0,
  "status": "healthy",
  "message": "No data integrity issues detected",
  "timestamp": "2025-09-30T..."
}
```

---

## 🐛 Troubleshooting

### Problema 1: "Function does not exist"

**Sintomo:** Error 42883 nei log o dashboard vuoto

**Soluzione:**
1. Verifica che la migration sia stata applicata:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_name LIKE 'get_%';
```

2. Se nessuna function, ri-esegui la migration `20250930_database_health.sql`

---

### Problema 2: "Permission denied for pg_stat_activity"

**Sintomo:** Connection stats non funziona

**Soluzione:**
```sql
-- Dai permessi alla view
GRANT SELECT ON pg_stat_activity TO service_role;
```

---

### Problema 3: Cache Hit Ratio sempre 100%

**Sintomo:** Ratio sempre 100%, sembra sospetto

**Causa:** Database nuovo o poco utilizzato = tutto in cache

**Soluzione:** Non è un problema! È normale per database piccoli o con pochi accessi.

---

### Problema 4: Dashboard lento (> 5 secondi)

**Sintomo:** Loading troppo lungo

**Cause possibili:**
- Troppe tabelle (> 100)
- Query statistics pesanti
- Database sotto carico

**Soluzione:**
- Ridurre LIMIT nelle function (es. da 20 a 10)
- Aggiungere indici su pg_stat_user_tables
- Eseguire ANALYZE sulle system tables

---

## ✅ Checklist Finale

Prima di considerare Phase 1.3 completo:

### Dashboard Accessibilità
- [ ] Dashboard accessibile su `/super-admin/database-health`
- [ ] Link "Database Health" presente in super-admin homepage
- [ ] Loading state funziona
- [ ] Error handling funziona
- [ ] Refresh button funziona

### Metriche Visibili
- [ ] Connection stats mostrate correttamente
- [ ] Cache hit ratio calcolato
- [ ] Table statistics listate (top 10)
- [ ] Index usage mostrato
- [ ] Long queries detection funziona
- [ ] Deadlock count visibile
- [ ] Vacuum stats mostrate

### Function PostgreSQL
- [ ] Tutte le 8 function create
- [ ] GRANT statements applicati
- [ ] Nessun errore "permission denied"
- [ ] Function eseguibili via API

### Performance
- [ ] Dashboard carica in < 5 secondi
- [ ] Nessun errore nei log Vercel
- [ ] API risponde in < 3 secondi
- [ ] Function non causano lock sul database

### Integration
- [ ] Navigazione tra dashboard fluida
- [ ] Bottone "Back" funziona
- [ ] Timestamp "Last updated" visibile
- [ ] Badge colorati corretti per status

---

## 📊 Metriche di Successo

**Sistema considerato funzionante se:**
- ✅ Dashboard carica senza errori
- ✅ Cache hit ratio > 95%
- ✅ Connection usage < 50%
- ✅ Long queries = 0
- ✅ Deadlocks = 0
- ✅ Data integrity = healthy
- ✅ Nessuna tabella con dead tuple ratio > 20%

---

## 📈 Valori di Riferimento

### Cache Hit Ratio
- **> 99%** = Excellent ✅
- **95-99%** = Good ✅
- **90-95%** = Fair ⚠️
- **< 90%** = Poor ❌

### Connection Usage
- **< 50%** = Healthy ✅
- **50-80%** = Moderate ⚠️
- **> 80%** = High ❌

### Dead Tuple Ratio
- **< 10%** = Healthy ✅
- **10-20%** = Monitor ⚠️
- **> 20%** = Needs Vacuum ❌

### Index Efficiency
- **> 80%** = Excellent ✅
- **50-80%** = Good ✅
- **< 50%** = Poor ❌ (serve ottimizzazione)

---

## 🎯 Prossimi Step

Dopo Phase 1.3:
1. **Monitorare metriche** per 1 settimana
2. **Identificare pattern** (es. query lente ricorrenti)
3. **Ottimizzare** indici e query problematiche
4. **Configurare alert** automatici (future work)
5. **Iniziare Phase 2.1** - Billing & Subscriptions

---

## 📞 Supporto

**File di riferimento:**
- Migration: `/supabase/migrations/20250930_database_health.sql`
- API: `/src/app/api/super-admin/database-health/route.ts`
- Dashboard: `/src/app/super-admin/database-health/page.tsx`
- Data Integrity API: `/src/app/api/super-admin/data-integrity/route.ts`

**Documentazione:**
- `ROADMAP.md` - Phase 1.3 completato
- `CLAUDE.md` - Sezione Supabase Permissions
- `TESTING_INSTRUCTIONS.md` - Test completi Phase 1.1 e 1.2

---

*Ultima modifica: 30 Settembre 2025*
*Phase 1.3 - Database Health & Backup: COMPLETATO ✅*
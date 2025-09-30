# 🧪 Istruzioni per Testare il Sistema di Monitoring Completo

*Data: 30 Settembre 2025*

## 📋 Panoramica

Questo documento descrive come testare tutte le funzionalità di monitoring implementate:
- **System Health Monitoring** (Phase 1.1)
- **Performance Monitoring** (Phase 1.2)
- **Database Storage Monitoring** (Phase 1.2)

---

## 🚀 PASSO 1: Deployment delle Migrazioni SQL

### 1.1 Applica la Migration di Performance Monitoring

**File:** `/supabase/migrations/20250929_performance_monitoring.sql`

**Opzioni per applicare:**

#### Opzione A: Via Supabase Dashboard
1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il progetto `sch-pro-next`
3. Vai su **SQL Editor** (nel menu laterale)
4. Clicca su **New query**
5. Copia e incolla il contenuto di `20250929_performance_monitoring.sql`
6. Clicca su **Run** (▶️)
7. Verifica che non ci siano errori

#### Opzione B: Via Supabase CLI
```bash
# Se hai Supabase CLI installato
supabase db push
```

**⚠️ IMPORTANTE:** Questa migration include:
- Tabella `api_performance_logs` per logging performance
- Tabella `system_metrics` per metriche sistema
- Tabella `performance_summary` per aggregazioni
- **GRANT statements** per service_role (CRITICO!)

**Verifica che la migration sia applicata:**
```sql
-- Esegui questa query in Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('api_performance_logs', 'system_metrics', 'performance_summary');
```
Dovresti vedere tutte e 3 le tabelle.

---

### 1.2 Applica la Migration di Storage Monitoring

**File:** `/supabase/migrations/20250930_storage_monitoring.sql`

**Opzioni per applicare:**

#### Opzione A: Via Supabase Dashboard
1. Vai su **SQL Editor** in Supabase Dashboard
2. Copia e incolla il contenuto di `20250930_storage_monitoring.sql`
3. Clicca su **Run** (▶️)
4. Verifica che non ci siano errori

#### Opzione B: Via Supabase CLI
```bash
supabase db push
```

**Verifica che la function sia creata:**
```sql
-- Esegui questa query in Supabase SQL Editor
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'get_table_sizes';
```
Dovresti vedere la function `get_table_sizes` di tipo `FUNCTION`.

---

## 🚀 PASSO 2: Deploy su Vercel

### 2.1 Commit e Push del Codice

```bash
# Verifica lo stato
git status

# Aggiungi tutti i file modificati
git add .

# Crea il commit
git commit -m "Add complete monitoring system: performance, storage, and health checks"

# Push su main
git push origin main
```

### 2.2 Verifica il Deploy su Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il progetto `sch-pro-next`
3. Vai su **Deployments**
4. Attendi che il deploy sia completato (status: **Ready**)
5. Clicca su **Visit** per aprire il sito

---

## 🧪 PASSO 3: Testing - System Health Monitoring

### 3.1 Accedi come Super Admin

1. Vai su: `https://your-domain.vercel.app/login`
2. Usa le credenziali super-admin
3. Vai su: `https://your-domain.vercel.app/super-admin`

### 3.2 Testa System Monitoring

1. Clicca su **"System Monitoring"**
2. Dovresti vedere il dashboard con:
   - ✅ **Health Checks** per Database, SMTP, ShipsGo
   - 🔄 **Live Updates** (refresh automatico ogni 10 secondi)
   - 🔔 **Alert Panel** (vuoto se tutto OK)

**Test da fare:**

#### Test 1: Live Updates
- Osserva il badge "Last updated: X seconds ago"
- Dovrebbe aggiornarsi automaticamente ogni 10 secondi
- Il pulsante "Auto-Refresh" dovrebbe essere ON (verde)

#### Test 2: Manual Refresh
- Clicca su "Refresh" in alto a destra
- Le health checks dovrebbero ricaricarsi immediatamente
- Il timestamp "Last updated" dovrebbe resettarsi a "just now"

#### Test 3: Alert Toggle
- Clicca su "Alerting: ON" per disabilitare
- Dovrebbe diventare "Alerting: OFF" (grigio)
- Clicca di nuovo per riabilitare

#### Test 4: Browser Notifications (opzionale)
- Clicca su "Enable Notifications"
- Concedi i permessi nel browser
- Se un servizio va down, dovresti ricevere una notifica browser

**Risultati attesi:**
- ✅ **Database**: Healthy (verde) con response time < 1000ms
- ✅ **SMTP**: Healthy (verde) se configurato correttamente
- ✅ **ShipsGo**: Healthy (verde) se API key è valida
- ⚠️ **SMTP/ShipsGo**: Degraded (giallo) se non configurati

---

## 🧪 PASSO 4: Testing - Performance Monitoring

### 4.1 Accedi alla Performance Dashboard

1. Dal super-admin dashboard, clicca su **"Performance Analytics"**
2. O vai direttamente: `https://your-domain.vercel.app/super-admin/performance`

### 4.2 Inizialmente Dashboard Vuota

**Al primo accesso vedrai:**
- ⚠️ Banner giallo: "No Performance Data Yet"
- Grafici vuoti o con valori a 0
- Questo è **NORMALE** - non ci sono ancora dati!

### 4.3 Genera Dati di Performance

**Per popolare il dashboard con dati reali, fai delle chiamate API:**

#### Metodo 1: Usa l'Applicazione Normalmente
1. Vai su: `https://your-domain.vercel.app/dashboard`
2. Naviga tra le sezioni:
   - **Tracking** → fa chiamate a `/api/trackings`
   - **Spedizioni** → fa chiamate a `/api/shipments`
   - **Prodotti** → fa chiamate a `/api/products`
3. Crea/modifica alcune spedizioni o prodotti
4. Ogni azione genera log di performance

#### Metodo 2: Chiamate API Dirette (Postman/cURL)

**Esempio con cURL:**
```bash
# Login per ottenere il token
curl -X POST https://your-domain.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'

# Ottieni shipments (genera log)
curl -X GET https://your-domain.vercel.app/api/shipments \
  -H "Authorization: Bearer YOUR_TOKEN"

# Ripeti 10-20 volte per generare dati significativi
```

#### Metodo 3: Script di Load Testing (Opzionale)
```bash
# Installa artillery per load testing
npm install -g artillery

# Crea file config.yml
cat > load-test.yml <<EOF
config:
  target: 'https://your-domain.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - flow:
    - get:
        url: "/api/shipments"
EOF

# Esegui il test
artillery run load-test.yml
```

### 4.4 Verifica i Dati nel Dashboard

**Dopo aver generato traffico, torna su Performance Dashboard:**

1. Clicca su **"Refresh"** o ricarica la pagina
2. Ora dovresti vedere:

**📊 Summary Cards (in alto):**
- **Total Requests**: numero di chiamate API registrate
- **Error Rate**: percentuale di errori (idealmente < 5%)
- **Avg Response Time**: tempo medio (idealmente < 500ms)
- **P95 Response Time**: 95° percentile

**📈 Grafici:**
- **Requests Over Time**: grafico a linea delle chiamate nel tempo
- **Error Rate Over Time**: grafico dell'error rate
- **Response Time Distribution**: istogramma dei tempi di risposta
- **Top Endpoints**: bar chart degli endpoint più chiamati

**📋 Tabelle:**
- **Endpoint Breakdown**: statistiche per endpoint
- **Slow Queries**: query con response time > 1000ms

### 4.5 Test dei Time Range

**Testa i filtri temporali:**
- Clicca su **"1h"** → mostra dati ultima ora
- Clicca su **"24h"** → mostra dati ultime 24 ore
- Clicca su **"7d"** → mostra dati ultimi 7 giorni
- Clicca su **"30d"** → mostra dati ultimi 30 giorni

**Risultati attesi:**
- I grafici si aggiornano immediatamente
- Il summary cambia in base al time range
- Il badge "Time Range: X" si aggiorna

---

## 🧪 PASSO 5: Testing - Database Storage Monitoring

### 5.1 Accedi alla Storage Dashboard

1. Dal super-admin dashboard, clicca su **"Database Storage"**
2. O vai direttamente: `https://your-domain.vercel.app/super-admin/storage`

### 5.2 Verifica Metriche Storage

**Dovresti vedere:**

**📊 Overview Cards (in alto):**
- **Total Storage**: dimensione totale in GB/MB
- **Total Tables**: numero di tabelle nel database
- **Total Rows**: totale righe in tutte le tabelle
- **Largest Table**: nome e dimensione della tabella più grande

**📈 Grafico a Torta:**
- **Largest Tables Distribution**: Top 5 tabelle per dimensione
- Hover per vedere dettagli (size + percentuale)

**📋 Lista Top 5 Tables:**
- Nome tabella
- Row count
- Size in MB
- Index size

**📋 Tabella Completa:**
- Tutte le tabelle del database
- Colonne: Table Name, Rows, Total Size, Table Size, Indexes

### 5.3 Test Funzionalità

#### Test 1: Refresh Manuale
- Clicca su **"Refresh"** in alto a destra
- I dati dovrebbero ricaricarsi
- Il loading spinner dovrebbe apparire brevemente

#### Test 2: Verifica Dati Reali
**Confronta con Supabase Dashboard:**
1. Vai su Supabase Dashboard → Table Editor
2. Seleziona una tabella (es. `shipments`)
3. Guarda il row count
4. Confronta con il valore nel dashboard Storage
5. Dovrebbero corrispondere (±1 per differenze di timing)

#### Test 3: Fallback Mode (se function non esiste)
**Se la migration non è stata applicata:**
- Vedrai un banner giallo: "Size data unavailable"
- Il dashboard mostrerà solo **row counts** senza dimensioni
- Questo è il **fallback mode** - funziona comunque!

**Per abilitare full mode:**
- Applica la migration `20250930_storage_monitoring.sql`
- Clicca su Refresh
- Ora dovresti vedere le dimensioni in MB/GB

---

## 🧪 PASSO 6: Testing Completo End-to-End

### 6.1 Scenario di Test Completo

**Esegui questo workflow per testare l'intero sistema:**

1. **Login come super-admin**
   ```
   → https://your-domain.vercel.app/login
   ```

2. **Vai su Super Admin Dashboard**
   ```
   → https://your-domain.vercel.app/super-admin
   ```

3. **Test System Monitoring**
   - Clicca su "System Monitoring"
   - Verifica che tutti i servizi siano Healthy
   - Abilita Auto-Refresh
   - Osserva gli updates per 30 secondi

4. **Test Performance Monitoring**
   - Clicca su "Performance Analytics"
   - Se vuoto, genera traffico (vedi 4.3)
   - Testa i time range (1h, 24h, 7d)
   - Verifica che i grafici si aggiornino

5. **Test Storage Monitoring**
   - Clicca su "Database Storage"
   - Verifica che le tabelle siano listate
   - Controlla il pie chart
   - Verifica che i totali abbiano senso

6. **Test Automatico Performance Logging**
   - Vai su Dashboard normale: `/dashboard`
   - Naviga tra Tracking, Spedizioni, Prodotti
   - Torna su Performance Analytics
   - Clicca Refresh
   - Dovresti vedere **nuovi log** generati dalle tue azioni

---

## 🐛 Troubleshooting

### Problema 1: Performance Dashboard Vuoto

**Sintomo:** "No Performance Data Yet" anche dopo aver generato traffico

**Soluzioni:**
1. Verifica che la migration sia applicata:
   ```sql
   SELECT * FROM api_performance_logs LIMIT 5;
   ```
2. Verifica i log Vercel:
   - Vai su Vercel Dashboard → Logs
   - Filtra per `/api/shipments` o `/api/products`
   - Cerca errori di "Performance log error"
3. Verifica env var `SUPABASE_SERVICE_ROLE_KEY` in Vercel

### Problema 2: Storage Dashboard Error

**Sintomo:** "Storage Data Unavailable" con errore

**Soluzioni:**
1. Verifica che la function esista:
   ```sql
   SELECT routine_name FROM information_schema.routines
   WHERE routine_name = 'get_table_sizes';
   ```
2. Se non esiste, applica la migration `20250930_storage_monitoring.sql`
3. Se esiste ma non funziona, verifica i permessi:
   ```sql
   GRANT EXECUTE ON FUNCTION get_table_sizes() TO service_role;
   ```

### Problema 3: System Monitoring Sempre "Down"

**Sintomo:** Database/SMTP/ShipsGo sempre mostrati come "Down"

**Soluzioni:**
1. **Database Down:**
   - Verifica `NEXT_PUBLIC_SUPABASE_URL` in Vercel
   - Verifica `SUPABASE_SERVICE_ROLE_KEY` in Vercel

2. **SMTP Down:**
   - Verifica env vars SMTP in Vercel:
     - `SMTP_HOST`
     - `SMTP_PORT`
     - `SMTP_USER`
     - `SMTP_PASSWORD`

3. **ShipsGo Down:**
   - Verifica `SHIPSGO_API_KEY` in Vercel
   - Verifica che l'API key sia valida

### Problema 4: "permission denied for table"

**Sintomo:** Error 42501 nei log

**Soluzione:**
```sql
-- Esegui in Supabase SQL Editor
GRANT ALL ON TABLE api_performance_logs TO service_role;
GRANT ALL ON TABLE api_performance_logs TO authenticated;

GRANT ALL ON TABLE system_metrics TO service_role;
GRANT ALL ON TABLE system_metrics TO authenticated;

GRANT ALL ON TABLE performance_summary TO service_role;
GRANT ALL ON TABLE performance_summary TO authenticated;
```

---

## ✅ Checklist Finale

Prima di considerare il testing completo, verifica:

### System Health Monitoring
- [ ] Dashboard accessibile su `/super-admin/monitoring`
- [ ] Database health check funziona
- [ ] SMTP health check funziona (o mostra "Not Configured")
- [ ] ShipsGo health check funziona (o mostra "Not Configured")
- [ ] Auto-refresh funziona (updates ogni 10s)
- [ ] Alert system funziona (se servizio va down)
- [ ] Browser notifications funzionano (opzionale)

### Performance Monitoring
- [ ] Dashboard accessibile su `/super-admin/performance`
- [ ] Migration applicata (tabelle create)
- [ ] GRANT statements applicati (no permission errors)
- [ ] Automatic logging funziona su `/api/shipments`
- [ ] Automatic logging funziona su `/api/products`
- [ ] Automatic logging funziona su `/api/trackings`
- [ ] Grafici si popolano con dati reali
- [ ] Time range filters funzionano (1h, 24h, 7d, 30d)
- [ ] Endpoint breakdown mostra statistiche
- [ ] Slow queries detection funziona (> 1000ms)

### Database Storage Monitoring
- [ ] Dashboard accessibile su `/super-admin/storage`
- [ ] Migration applicata (function creata)
- [ ] Overview cards mostrano dati corretti
- [ ] Pie chart mostra top 5 tables
- [ ] Lista completa tabelle visibile
- [ ] Row counts corrispondono a Supabase
- [ ] Size in MB/GB mostrata (se function applicata)
- [ ] Fallback mode funziona (se function non applicata)

### Integration & Navigation
- [ ] Link "System Monitoring" presente in super-admin dashboard
- [ ] Link "Performance Analytics" presente in super-admin dashboard
- [ ] Link "Database Storage" presente in super-admin dashboard
- [ ] Tutti i bottoni "Back" funzionano
- [ ] Tutti i bottoni "Refresh" funzionano
- [ ] Loading states visibili durante fetch
- [ ] Error states gestiti correttamente

---

## 📊 Risultati Attesi

Dopo aver completato tutti i test, dovresti avere:

1. **System Monitoring** funzionante con live updates
2. **Performance Dashboard** che mostra metriche reali di traffico API
3. **Storage Dashboard** che mostra dimensioni e row counts di tutte le tabelle
4. **Automatic logging** che popola il performance dashboard in background
5. **Zero errori** nei log di Vercel
6. **Response times < 1 secondo** per la maggior parte delle API

---

## 🎯 Metriche di Successo

**Sistema considerato funzionante se:**
- ✅ Tutti i 3 dashboard sono accessibili
- ✅ Nessun errore 500 nelle API di monitoring
- ✅ Performance logging automatico funziona
- ✅ Grafici si popolano con dati reali
- ✅ Storage dashboard mostra almeno row counts
- ✅ System health checks completano in < 5 secondi

---

## 📞 Supporto

Se riscontri problemi:
1. Controlla i log Vercel per errori specifici
2. Verifica che tutte le migrations siano applicate
3. Verifica che tutte le env vars siano configurate
4. Controlla la sezione Troubleshooting sopra

**File di riferimento:**
- Migration Performance: `/supabase/migrations/20250929_performance_monitoring.sql`
- Migration Storage: `/supabase/migrations/20250930_storage_monitoring.sql`
- Performance Logger: `/src/lib/performanceLogger.ts`
- Storage API: `/src/app/api/super-admin/storage/route.ts`
- Documentazione: `/CLAUDE.md` (sezione Supabase Permissions)

---

*Ultima modifica: 30 Settembre 2025*
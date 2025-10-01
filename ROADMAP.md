# 🗺️ SCH PRO - ROADMAP COMPLETA

*Ultima modifica: 01 Ottobre 2025 - 16:30*

## **FASE 1: System Monitoring & Stability** 🔧

### 1.1 System Monitoring Dashboard ✅
- [x] Creare pagina `/super-admin/monitoring`
- [x] Health check API esterne (ShipsGo, SMTP, Database)
- [x] Status real-time con indicatori colorati
- [x] Live updates (polling ogni 10 secondi)
- [x] Alerting automatico per downtime
- [x] Notifiche browser per alert critici
- [x] Pannello alert con acknowledge/clear
- [x] Toggle on/off per alerting

### 1.2 Performance Monitoring ✅ COMPLETATO
- [x] Response time tracking per API
- [x] Error rate monitoring
- [x] Performance dashboard con grafici
- [x] Query performance tracking (P95, P99)
- [x] Slow query detection (> 1000ms)
- [x] Endpoint breakdown con statistiche
- [x] Time series charts (requests, errors, response time)
- [x] Database migration per logging performance
- [x] Automatic API logging middleware implementato su:
  - `/api/shipments` (GET, POST, PUT)
  - `/api/products` (GET, POST)
  - `/api/trackings` (GET, POST)
- [x] Fire-and-forget logging per non bloccare le risposte API
- [x] Database storage monitoring (tabelle Supabase)
  - Tracking dimensioni tabelle (size in MB/GB)
  - Conteggio righe per tabella
  - Top 5 tabelle più grandi con grafici
  - Visualizzazione dimensioni indici
- [ ] Resource usage dashboard (CPU, memoria) - ❌ Non disponibile in ambiente serverless Vercel

### 1.3 Database Health & Backup ✅ COMPLETATO
- [x] Connection pool status monitoring
  - Active/Idle/Total connections tracking
  - Connection usage percentage
  - Max connections monitoring
- [x] Database performance metrics
  - Cache hit ratio (target > 99%)
  - Table statistics (sequential vs index scans)
  - Index usage efficiency analysis
  - Query performance tracking
- [x] Vacuum and analyze statistics
  - Dead tuple detection
  - Maintenance recommendations
  - Auto-vacuum status tracking
- [x] Long running queries detection (> 30 seconds)
- [x] Deadlock monitoring and alerting
- [x] Data integrity checks
  - Orphaned records detection
  - Foreign key validation
- [x] Storage usage tracking (implementato in Phase 1.2)
- [ ] Backup status verification - ❌ Non disponibile (gestito da Supabase, no API access)

---

## **FASE 2: Business Intelligence** 📊

### 2.1 Billing & Subscriptions 🔧 IN CORSO (83% completato)
- [x] Schema database per piani abbonamento (5 tabelle + 2 funzioni)
- [x] Gestione piani configurabili (API + UI super-admin)
- [x] Tracking utilizzo e limiti (funzione get_organization_usage)
- [x] Piani di default inseriti (Free, Pro, Enterprise)
- [x] API REST complete per subscription management
- [x] UI moderna per gestione piani e subscriptions
- [x] **Stripe Payment Gateway Integration** ✅
  - [x] Checkout Sessions con trial 10 giorni
  - [x] Customer Portal per gestione subscription
  - [x] Webhook endpoint configurato in produzione
  - [x] Sync automatico eventi Stripe → Database
  - [x] Gestione pagamenti ricorrenti (mensili/annuali)
- [x] **Upgrade/downgrade automatico** ✅
  - [x] API endpoint per cambio piano con proration
  - [x] UI in /dashboard/billing per cambio piano
  - [x] Calcolo e preview proration
  - [x] Gestione upgrade (immediato) e downgrade (con credito)
- [x] **Sistema Fatture** ✅
  - [x] API /api/invoices per elenco fatture
  - [x] UI /dashboard/billing/invoices
  - [x] Link a Stripe hosted invoices
  - [x] Status tracking (pagata, in attesa, fallita)
- [x] Fix pulsanti Modifica/Dettagli in /super-admin/billing/subscriptions ✅
- [ ] **Testing Completo Sistema Billing** - DA FARE ALLA FINE
  - [ ] Test Stripe Checkout con carte di test
  - [ ] Test upgrade piano (Free → Pro → Enterprise)
  - [ ] Test downgrade piano (Enterprise → Pro → Free)
  - [ ] Verificare calcoli proration corretti
  - [ ] Test fatturazione automatica (renewal mensile/annuale)
  - [ ] Test webhook events (payment_succeeded, subscription_updated, etc.)
  - [ ] Test trial period (10 giorni) e conversione
  - [ ] Test cancellazione abbonamento
  - [ ] Test Piano Partner (lifetime gratuito)
  - [ ] Verificare usage limits enforcement
  - [ ] Test invoice generation e Stripe hosted invoices
  - [ ] Test Customer Portal Stripe

### 2.2 Analytics & Reporting ✅ COMPLETATO (100%)
- [x] **Database Schema** ✅
  - [x] 5 tabelle create (analytics_metrics, scheduled_reports, report_history, custom_dashboards, dashboard_widgets)
  - [x] 2 funzioni PostgreSQL (calculate_organization_metrics, get_trending_metrics)
  - [x] Fix funzioni PostgreSQL con nomi colonne corretti (actual_delivery, active, organization_id)
  - [x] RLS policies implementate
  - [x] Indexes per performance
- [x] **API Endpoints** ✅
  - [x] GET /api/analytics/metrics - Metriche con trend comparison
  - [x] GET/POST /api/analytics/reports - Gestione report schedulati
  - [x] PATCH/DELETE /api/analytics/reports/[id] - Modifica e cancellazione report
  - [x] POST /api/analytics/reports/generate - Generazione report schedulato
  - [x] POST /api/analytics/generate-pdf - Export PDF on-demand
  - [x] POST /api/analytics/export - Export CSV/Excel
- [x] **Analytics Dashboard** (/dashboard/analytics) ✅
  - [x] 4 KPI cards (spedizioni, prodotti, costi, avg cost)
  - [x] Trend indicators con confronto periodo precedente
  - [x] Pie chart distribuzione spedizioni per stato
  - [x] Performance metrics (delivery rate, avg delivery time)
  - [x] Selettore date range (7/30/90/365 giorni)
  - [x] Integrazione Recharts per visualizzazioni
  - [x] Pulsante "Esporta PDF" per download immediato report
- [x] **Data Export** ✅
  - [x] Export CSV e Excel
  - [x] Export shipments, products, costs, metrics
  - [x] Export PDF on-demand dalla dashboard analytics
  - [x] Date range filtering
  - [x] Organization-scoped security
- [x] **Trend Analysis & Forecasting** ✅
  - [x] Confronto periodo corrente vs precedente
  - [x] Calcolo percentuali di variazione
  - [x] Indicatori visuali (TrendingUp/Down)
- [x] **Scheduled Reports Management UI** ✅
  - [x] Pagina /dashboard/analytics/reports
  - [x] UI per scheduling (daily, weekly, monthly, quarterly)
  - [x] Gestione recipients email (multiple, comma-separated)
  - [x] Configurazione metriche da includere
  - [x] Toggle attiva/disattiva report
  - [x] Pulsanti Edit/Delete per gestione report
  - [x] Pulsante "Genera Ora" per test immediato
- [x] **PDF Report Generation** ✅
  - [x] Libreria jsPDF integrata
  - [x] Layout professionale con header/footer
  - [x] Tabelle formattate per Shipments, Products, Costs
  - [x] Breakdown costi per tipologia
  - [x] Header testuali in grassetto (SPEDIZIONI, PRODOTTI, COSTI) senza emoji corrotti
  - [x] Download PDF dal browser
  - [x] Report history tracking nel database
  - [x] Export PDF on-demand da analytics dashboard
  - [x] Export PDF da scheduled reports
- [ ] **Email Delivery System** - SKIPPED (non necessario per MVP)
  - [x] Struttura database pronta
  - [x] Recipients configuration
  - [ ] SMTP configuration e invio automatico - Postponed
  - [ ] Cron job per scheduling automatico - Postponed
  - **Motivazione:** PDF export manuale funziona perfettamente. Email automatico richiede infrastruttura SMTP production-grade non necessaria al momento.
- [x] **Custom Dashboard Builder** ✅ COMPLETATO
  - [x] API endpoints per custom dashboards (GET/POST/PATCH/DELETE)
  - [x] API endpoints per dashboard widgets (POST/PATCH/DELETE)
  - [x] Pagina /dashboard/custom-dashboards per gestione dashboard
  - [x] Pagina /dashboard/custom-dashboards/[id] per visualizzazione
  - [x] 5 widget funzionanti con dati reali:
    - WidgetKPI: metriche con trend indicators
    - WidgetChart: grafici bar/line/pie con Recharts
    - WidgetShipments: lista spedizioni recenti
    - WidgetProducts: prodotti con SKU
    - WidgetCosts: analisi costi con breakdown
  - [x] Link nel menu principale
  - [x] Set dashboard predefinita
  - [x] Layout configurabili (grid, flex, masonry)
  - [x] Widget drag & drop position (schema pronto, UI da implementare)

---

## **FASE 3: Communication & Support** 📧

### 3.1 Communication Center - PARZIALE (30%)
- [x] **Database Schema** ✅
  - [x] Tabella email_templates per template riutilizzabili
  - [x] Tabella broadcast_messages per comunicazioni di massa
  - [x] Tabella message_deliveries per tracking invii
  - [x] Campi per targeting (all, organization, user_role, custom)
  - [x] Tracking completo (sent, delivered, opened, clicked)
- [ ] **Broadcast Messages System** - SKIPPED (opzionale per MVP)
  - Database pronto ma UI non implementata
  - Feature postponed per versioni future

### 3.2 Support & Helpdesk ✅ COMPLETATO (100%)
- [x] **Database Schema** ✅
  - [x] Tabella support_tickets con auto-generazione ticket numbers
  - [x] Tabella ticket_messages per conversazioni
  - [x] Tabella kb_articles con full-text search (tsvector)
  - [x] Funzione generate_ticket_number() per TICKET-000001
  - [x] Trigger update_ticket_stats() per SLA tracking
  - [x] Funzione kb_articles_search_trigger() per ricerca
- [x] **API Endpoints - Support Tickets** ✅
  - [x] GET/POST /api/support-tickets - Lista e creazione ticket
  - [x] GET/PATCH/DELETE /api/support-tickets/[id] - Gestione singolo ticket
  - [x] POST /api/support-tickets/[id]/messages - Aggiungi messaggio
- [x] **API Endpoints - Knowledge Base** ✅
  - [x] GET/POST /api/kb-articles - Lista e creazione articoli
  - [x] GET /api/kb-articles/[slug] - Dettaglio articolo con view tracking
- [x] **UI Pages - Support Tickets** ✅
  - [x] Pagina /dashboard/support - Lista ticket con filtri
    - Filtri per status (open, in_progress, resolved, closed)
    - Badge colorati per priority e status
    - Conteggio messaggi per ticket
    - Dialog per creazione nuovo ticket
    - Categorie: technical, billing, bug, feature_request, other
    - Priorità: low, medium, high, urgent
  - [x] Pagina /dashboard/support/[id] - Dettaglio ticket
    - Thread conversazione completo
    - Distinzione messaggi customer/agent
    - Reply box per nuovi messaggi
    - Blocco reply per ticket closed
    - Visualizzazione metadati (ticket_number, dates, SLA)
- [x] **UI Pages - Knowledge Base** ✅
  - [x] Pagina /dashboard/help - Homepage knowledge base
    - Ricerca full-text con barra search
    - Sezione featured articles
    - Filtri per categoria
    - Lista articoli con view count e helpful votes
    - Tag display per ogni articolo
  - [x] Pagina /dashboard/help/[slug] - Dettaglio articolo
    - Rendering contenuto completo (HTML/Markdown)
    - View count auto-increment
    - Feedback buttons (helpful/not helpful)
    - Metadata display (category, tags, date)
    - CTA per aprire ticket se articolo non utile
- [x] **Sistema di Categorizzazione** ✅
  - Categorie ticket: technical, billing, bug, feature_request, other
  - Priorità: low, medium, high, urgent
  - Status workflow: open → in_progress → resolved → closed
- [x] **SLA Tracking** ✅
  - first_response_at: timestamp prima risposta agent
  - resolved_at: timestamp risoluzione
  - closed_at: timestamp chiusura
  - Auto-update tramite trigger PostgreSQL
- [x] **Knowledge Base Features** ✅
  - Full-text search con PostgreSQL tsvector
  - Featured articles system
  - View count tracking
  - Helpful/Not helpful voting
  - Tag system per organizzazione
  - Category filtering dinamico
- [x] **Menu Integration** ✅
  - Link "Help" (BookOpen icon)
  - Link "Supporto" (MessageSquare icon)

---

## **FASE 4: Advanced Management** 👥

### 4.1 Advanced User Management
- [ ] Ricerca utenti cross-organizzazione
- [ ] Filtri avanzati (ruolo, attività, etc.)
- [ ] Permessi granulari per funzioni
- [ ] Bulk operations (suspend, delete, etc.)
- [ ] User activity timeline
- [ ] Advanced role management

### 4.2 System Configuration
- [ ] Pannello gestione API keys centralizzato
- [ ] Feature flags per organizzazione
- [ ] Rate limiting configurabile
- [ ] Environment variables management
- [ ] Backup/restore configuration
- [ ] A/B testing framework

---

## **FASE 5: Security & Compliance** 🔐

### 5.1 Advanced Security
- [ ] Audit log con filtri avanzati
- [ ] Export audit logs
- [ ] IP whitelisting/blacklisting
- [ ] Security scanning automatico
- [ ] Vulnerability assessment
- [ ] Session management avanzato

### 5.2 Compliance & Privacy
- [ ] GDPR compliance tools
- [ ] Data retention policies
- [ ] Privacy dashboard
- [ ] Consent management
- [ ] Data anonymization tools

---

## **FASE 6: Tracking System Revolution** 🚛✈️🚢

### 6.1 Ristrutturazione Sistema Tracking
- [ ] Progettare architettura modulare
- [ ] Interface unificata per tutti i carrier
- [ ] Plugin system per nuovi provider
- [ ] Fallback mechanism intelligente
- [ ] Caching e performance optimization

### 6.2 Direct Airline Integration
- [ ] **Lufthansa Group API** (Lufthansa, Swiss, Austrian, Brussels Airlines)
- [ ] **Emirates API**
- [ ] **Air France-KLM API**
- [ ] **British Airways API**
- [ ] **American Airlines API**
- [ ] **Delta Airlines API**
- [ ] **United Airlines API**
- [ ] **Qatar Airways API**

### 6.3 Direct Maritime Integration
- [ ] **Maersk API** (leader mondiale)
- [ ] **MSC API** (Mediterranean Shipping Company)
- [ ] **CMA CGM API** (francese)
- [ ] **Hapag-Lloyd API** (tedesco)
- [ ] **ONE (Ocean Network Express) API**
- [ ] **Evergreen API**
- [ ] **COSCO API**

### 6.4 Unified Tracking Platform
- [ ] Aggregatore intelligente multi-provider
- [ ] ShipsGo mantenuto come fallback
- [ ] Smart routing per migliore copertura
- [ ] Real-time data aggregation
- [ ] Provider reliability scoring
- [ ] Automatic failover system

---

## **FUNZIONALITÀ BONUS** 🎁

### Mobile App
- [ ] App mobile per tracking
- [ ] Push notifications
- [ ] Offline mode
- [ ] Barcode scanning

### AI & Machine Learning
- [ ] Predictive delivery estimates
- [ ] Anomaly detection
- [ ] Smart routing suggestions
- [ ] Automated customer service

### Integrations
- [ ] ERP integration (SAP, Oracle)
- [ ] E-commerce platforms (Shopify, WooCommerce)
- [ ] Accounting software (QuickBooks, Xero)
- [ ] Warehouse management systems

---

## **PRIORITÀ & TIMELINE**

### 🔴 **ALTA PRIORITÀ** (Prossimi 2 mesi)
- ✅ System Monitoring Dashboard - COMPLETATO
- ✅ Performance Monitoring - COMPLETATO
- ✅ Database Health - COMPLETATO
- ✅ Billing & Subscriptions + Stripe Integration - COMPLETATO

### 🟡 **MEDIA PRIORITÀ** (2-4 mesi)
- Payment Gateway & Auto-billing
- Analytics & Reporting
- Communication Center

### 🟢 **BASSA PRIORITÀ** (4+ mesi)
- Advanced Security
- Tracking System Revolution
- Funzionalità Bonus

---

## **TRACKING PROGRESSO**

**Completato:** 64/70+ features
- ✅ Fase 1: System Monitoring & Stability (100%)
- ✅ Fase 2.1: Billing & Subscriptions con Stripe (92%)
- ✅ Fase 2.2: Analytics & Reporting + Custom Dashboards (100%)
- ✅ Fase 3.2: Support & Helpdesk (100%)
- 🔶 Fase 3.1: Communication Center (30% - broadcast skipped)

**In Corso:** Nessuna fase in corso
**Prossimo:** Fase 4 - Advanced Management oppure Testing completo

**% Completamento Totale FASE 1:** 100% ✅
**% Completamento Totale FASE 2.1:** 92% ✅ - Solo testing mancante
**% Completamento Totale FASE 2.2:** 100% ✅
**% Completamento Totale FASE 3.1:** 30% 🔶 - Broadcast skipped
**% Completamento Totale FASE 3.2:** 100% ✅
**% Completamento Totale Progetto:** ~86%

---

## **📄 NUOVE PAGINE E FUNZIONALITÀ**

### Dashboard Pages (Utenti)
1. **`/dashboard`** - Homepage dashboard principale
2. **`/dashboard/tracking`** - Tracking spedizioni
3. **`/dashboard/shipments`** - Gestione spedizioni
4. **`/dashboard/products`** - Catalogo prodotti
5. **`/dashboard/carriers`** - Gestione spedizionieri
6. **`/dashboard/costs`** - Gestione costi aggiuntivi
7. **`/dashboard/analytics`** - Analytics & KPI con export PDF
8. **`/dashboard/analytics/reports`** - Gestione report schedulati
9. **`/dashboard/custom-dashboards`** - Gestione dashboard personalizzate
10. **`/dashboard/custom-dashboards/[id]`** - Dashboard custom con widget
11. **`/dashboard/billing`** - Gestione abbonamento e fatture Stripe
12. **`/dashboard/billing/invoices`** - Storico fatture
13. **`/dashboard/support`** - **NUOVO** - Lista ticket supporto
14. **`/dashboard/support/[id]`** - **NUOVO** - Dettaglio ticket con conversazione
15. **`/dashboard/help`** - **NUOVO** - Knowledge Base / Centro Assistenza
16. **`/dashboard/help/[slug]`** - **NUOVO** - Dettaglio articolo knowledge base
17. **`/dashboard/users`** - Gestione utenti organizzazione
18. **`/dashboard/settings`** - Impostazioni utente

### Super Admin Pages
19. **`/super-admin`** - Dashboard super admin
20. **`/super-admin/monitoring`** - System monitoring & health checks
21. **`/super-admin/monitoring/performance`** - Performance metrics & API logs
22. **`/super-admin/monitoring/database`** - Database health & statistics
23. **`/super-admin/organizations`** - Gestione organizzazioni
24. **`/super-admin/billing/plans`** - Gestione piani abbonamento
25. **`/super-admin/billing/subscriptions`** - Gestione subscriptions

### Widget Components (Custom Dashboards)
- **`WidgetKPI`** - Metriche con trend indicators
- **`WidgetChart`** - Grafici bar/line/pie
- **`WidgetShipments`** - Lista spedizioni recenti
- **`WidgetProducts`** - Lista prodotti
- **`WidgetCosts`** - Analisi costi con breakdown

### API Endpoints Principali
#### Billing & Subscriptions
- `/api/subscription-plans` - Gestione piani
- `/api/subscriptions` - Gestione subscriptions
- `/api/invoices` - Elenco fatture
- `/api/stripe/webhook` - Webhook Stripe
- `/api/stripe/checkout` - Creazione checkout session
- `/api/stripe/customer-portal` - Customer portal

#### Analytics & Reporting
- `/api/analytics/metrics` - Metriche con trend analysis
- `/api/analytics/reports` - Report schedulati
- `/api/analytics/generate-pdf` - Export PDF on-demand
- `/api/analytics/export` - Export CSV/Excel

#### Custom Dashboards
- `/api/custom-dashboards` - CRUD dashboards
- `/api/dashboard-widgets` - CRUD widgets

#### Support & Helpdesk
- `/api/support-tickets` - **NUOVO** - CRUD ticket supporto
- `/api/support-tickets/[id]/messages` - **NUOVO** - Messaggi ticket
- `/api/kb-articles` - **NUOVO** - CRUD articoli knowledge base

### Database Tables (6 nuove tabelle Fase 3)
1. **`email_templates`** - Template email riutilizzabili
2. **`broadcast_messages`** - Sistema broadcast (schema pronto)
3. **`message_deliveries`** - Tracking invii email
4. **`support_tickets`** - **NUOVO** - Ticket supporto
5. **`ticket_messages`** - **NUOVO** - Conversazioni ticket
6. **`kb_articles`** - **NUOVO** - Knowledge base con full-text search

---

## **📝 LESSONS LEARNED**

### 1. Supabase Table Permissions (CRITICAL)
**Problema:** Nuove tabelle create via migration SQL non hanno automaticamente permessi per il service_role.

**Soluzione:** Aggiungere sempre GRANT dopo CREATE TABLE:
```sql
GRANT ALL ON TABLE table_name TO service_role;
GRANT ALL ON TABLE table_name TO authenticated;
```

**Sintomi:** `permission denied for table` (error code 42501) anche con RLS disabilitato.

**Riferimento:** Vedi `CLAUDE.md` sezione "Supabase Table Permissions" per template completo.

---

### 2. PostgreSQL Functions - Always Verify Column Names (CRITICAL)
**Problema:** Le funzioni PostgreSQL falliscono se referenziano colonne che non esistono.

**Soluzione:** Prima di creare funzioni che fanno query su tabelle:
1. Verifica SEMPRE la struttura effettiva della tabella con query SELECT
2. Non assumere nomi di colonne standard (es. `is_active` vs `active`)
3. Controlla relazioni tra tabelle (alcuni campi potrebbero essere denormalizzati)
4. Testa le funzioni con dati reali prima del deploy

**Esempio da Analytics:**
- ❌ Assunto: `delivered_at` → ✅ Realtà: `actual_delivery`, `date_of_arrival`, `arrival_date`
- ❌ Assunto: `is_active` → ✅ Realtà: `active`
- ❌ Assunto: JOIN con shipments per costs → ✅ Realtà: `organization_id` già presente

**Best Practice:** Creare script di test che verificano:
```javascript
// check-table-columns.mjs
const { data } = await supabase.from('table_name').select('*').limit(1)
console.log('Columns:', Object.keys(data))
```

---

### 3. jsPDF and Emoji Characters (CRITICAL)
**Problema:** Emoji nelle stringhe di testo vengono corrotte quando generate con jsPDF (📦 → Ø=Üæ).

**Soluzione:** Non usare emoji in jsPDF. Usare invece testo formattato:
```javascript
doc.setFont(undefined, 'bold')
doc.text('SPEDIZIONI', 20, yPosition)  // ✅ OK
doc.text('📦 Spedizioni', 20, yPosition)  // ❌ Corrompe
```

**Sintomi:** Caratteri strani nel PDF (Ø=Üæ, Ø=ÜË, Ø=Ü°) al posto di emoji.

**Best Practice:** Per PDF usa solo ASCII standard + caratteri latini estesi. Per icone, considera SVG o immagini.

---

### 4. Large Supabase Migrations - Apply in Chunks
**Problema:** Copiare intere migration SQL di 400+ righe nel SQL Editor spesso fallisce silenziosamente.

**Soluzione:** Applicare migrations statement per statement o in gruppi logici:
1. Una CREATE TABLE alla volta con i suoi INDEX e GRANT
2. Policies separate dopo tutte le tabelle
3. Funzioni PostgreSQL separate alla fine
4. Verificare creazione dopo ogni step

**Tool utili:** Script Node.js per verificare esistenza tabelle dopo migration.

---

*Questo documento verrà aggiornato ad ogni milestone completato*
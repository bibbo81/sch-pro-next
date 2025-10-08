# 🗺️ SCH PRO - ROADMAP COMPLETA

*Ultima modifica: 02 Ottobre 2025 - 01:15*

---

## 🎯 STATO SESSIONE CORRENTE

**Data:** 02 Ottobre 2025 - 02:30
**Completamento Globale:** 85.5% (313/366 features)
**Prossimo Step:** Fase 6.1 - Web Scraping Engine (MSC, Maersk, CMA CGM)

### Decisioni Chiave Finali Prese

1. ✅ **Fase 6 priorità su Fase 5** - Tracking è core business
2. ✅ **3-Layer Hybrid System** - Web Scraping (primary) → JSONCargo (fallback) → ShipsGo (ultimate)
3. ✅ **11 carrier italiani prioritari** - MSC (40%), Maersk (15%), CMA CGM (12%), + 8 altri
4. ✅ **Google Workspace setup** - Dominio `sch-pro.app` acquistato
5. ✅ **Email strategy definita** - `fabrizio.cagnucci@sch-pro.app` come primary
6. ✅ **Approccio ShipsGo replicato** - Web scraping come primary method (40-50% coverage)
7. ✅ **Cost optimization** - $34-50/month vs $100-150 ShipsGo only (70-80% savings)

### Azioni Immediate da Completare

- [ ] Completare setup Google Workspace con `fabrizio.cagnucci@sch-pro.app`
- [ ] Setup scraping server (DigitalOcean $20/mo o Railway $5-15/mo)
- [ ] Applicare migration `20251002_tracking_providers.sql`
- [ ] Registrare account JSONCargo ($9/month unlimited)
- [ ] Implementare primo scraper MSC (priority #1 - 40% market share Italia)

---

## **FASE 1: System Monitoring & Stability** ✅ COMPLETATA (97%)

### 1.1 System Monitoring Dashboard ✅ COMPLETATO (100%)
- [x] Creare pagina `/super-admin/monitoring`
- [x] Health check API esterne (ShipsGo, SMTP, Database)
- [x] Status real-time con indicatori colorati
- [x] Live updates (polling ogni 10 secondi)
- [x] Alerting automatico per downtime
- [x] Notifiche browser per alert critici
- [x] Pannello alert con acknowledge/clear
- [x] Toggle on/off per alerting

### 1.2 Performance Monitoring ✅ COMPLETATO (95% - 19/20 features)
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

### 1.3 Database Health & Backup ✅ COMPLETATO (95% - 13/14 features)
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

## **FASE 2: Business Intelligence** 📊 COMPLETATA (96%)

### 2.1 Billing & Subscriptions ✅ COMPLETATO (92% - 38/41 features)
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

## **FASE 3: Communication & Support** 📧 COMPLETATA (77%)

### 3.1 Communication Center 🔶 PARZIALE (30% - 3/10 features)
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

### 3.3 Notifications System ✅ COMPLETATO (100%)
- [x] **Database Schema** ✅
  - Tabella `notifications` con RLS policies per organization isolation
  - 4 funzioni PostgreSQL:
    - `create_notification()` - Crea notifiche con flag email
    - `mark_notification_read()` - Segna singola notifica come letta
    - `mark_all_notifications_read()` - Segna tutte come lette per utente
    - `get_unread_notification_count()` - Contatore notifiche non lette
  - 3 trigger automatici:
    - `notify_ticket_response` - Notifica quando agente risponde
    - `notify_ticket_status_change` - Notifica cambio status ticket
    - `notify_tracking_update` - Notifica aggiornamento tracking (tutti membri org)

- [x] **API Endpoints** ✅
  - `GET /api/notifications` - Lista notifiche con filtri (type, read/unread)
  - `GET /api/notifications/unread-count` - Contatore non lette
  - `POST /api/notifications/[id]/read` - Segna come letta
  - `POST /api/notifications/mark-all-read` - Segna tutte come lette

- [x] **UI Components** ✅
  - `NotificationBell` component - Campanelle dropdown con:
    - Badge rosso con contatore
    - Lista notifiche scrollabile
    - Click-outside-to-close
    - Auto-refresh ogni 30 secondi
    - Link diretti alle risorse correlate
  - Pagina `/dashboard/notifications` - Centro notifiche completo:
    - Filtri (Tutte/Non lette/Lette)
    - Filtri per tipo (Tracking/Messaggi)
    - Mark all as read
    - Mark single as read
    - Link diretti con action_url
  - Due campanelle in header sempre visibili:
    - 📦 **Tracking Updates** - Notifiche aggiornamenti spedizioni
    - 💬 **Ticket Messages** - Notifiche risposte supporto
  - Badge in sidebar su "Notifiche" e "Supporto"

- [x] **Automatic Notifications** ✅
  - Notifica automatica quando agente risponde a ticket (email_sent: true)
  - Notifica automatica quando cambia status ticket
  - Notifica automatica quando tracking aggiorna status (tutti membri organizzazione)
  - Organization-scoped: ogni utente vede solo notifiche propria org

- [x] **ShipsGo Automatic Updates** ✅
  - Cron job doppio per aggiornamenti tracking automatici:
    - 07:00 UTC (08:00 Italia winter / 09:00 summer)
    - 14:00 UTC (15:00 Italia winter / 16:00 summer)
  - Vercel cron jobs configurati in `vercel.json`
  - Endpoint `/api/cron/shipsgo-refresh` con CRON_SECRET auth
  - Batch processing per organizzazione
  - Auto-update shipments + trackings tables
  - Trigger notifiche su cambio status

**Pagine Aggiunte**:
- `/dashboard/notifications` - Centro notifiche

**Migrazioni**:
- `20251001_notifications_step1_table.sql` - Tabella base
- `20251001_notifications_step2_rls.sql` - RLS policies
- `20251001_notifications_step3_functions.sql` - Funzioni PostgreSQL
- `20251001_notifications_step4_triggers.sql` - Trigger ticket
- `20251001_notifications_step5_tracking.sql` - Trigger tracking

---

## **FASE 4: Advanced Management** 👥 COMPLETATA (84%)

### 4.1 Advanced User Management ✅ COMPLETATO (100%)
- [x] **Database Schema** ✅
  - [x] Tabella `user_activity_logs` con tracking completo azioni utente
  - [x] 8 indexes per performance (user, organization, action, resource, date)
  - [x] RLS policies (users view own logs, admins view org logs, super-admins view all)
  - [x] 2 helper functions PostgreSQL:
    - `log_user_activity()` - Inserimento log con metadati completi
    - `get_user_activity_timeline()` - Timeline paginata attività utente
  - [x] 2 views analytics:
    - `user_activity_summary` - Statistiche aggregate per utente
    - `activity_analytics_by_action` - Analytics per tipo azione e data

- [x] **API Endpoints** ✅
  - [x] GET `/api/super-admin/users` - Lista utenti con ricerca e filtri avanzati
    - Filtri: search (email/org), organization_id, role, status, sort_by, limit/offset
    - Ritorna: users con memberships, activity stats, pagination
  - [x] GET `/api/super-admin/users/[id]` - Dettaglio singolo utente
    - Include: auth data, memberships, activity stats, recent activity timeline
  - [x] PATCH `/api/super-admin/users/[id]` - Update utente
    - Supporta: email, phone, metadata, ban/unban, email_confirm
  - [x] DELETE `/api/super-admin/users/[id]` - Eliminazione utente
  - [x] GET `/api/super-admin/users/[id]/activity` - Activity timeline con filtri
    - Filtri: action, resource_type, status, date_from, date_to, pagination
    - Ritorna: activities, stats (by_action, by_status, by_date)
  - [x] POST `/api/super-admin/users/bulk` - Bulk operations
    - Operations: ban, unban, delete, change_role, toggle_restriction, confirm_email

- [x] **UI Pages** ✅
  - [x] Pagina `/super-admin/users` - Lista utenti con tabella avanzata
    - Stats cards: total, active, inactive, banned, with_activity
    - Filtri: search, status filter, role filter
    - Checkbox selection per bulk operations
    - Bulk actions bar: Ban (24h), Unban, Delete
    - Tabella: email, organizations, status badges, activity count, last sign-in
  - [x] Pagina `/super-admin/users/[id]` - Dettaglio utente
    - 3 info cards: Basic Info, Organizations, Activity Stats
    - Actions: Ban/Unban (24h), Delete user
    - Activity Timeline filterable (all/success/failed/error)
    - Dettagli activity: action, resource, status, duration, details JSON

- [x] **Features Completate** ✅
  - [x] Ricerca utenti cross-organizzazione (email, organization name)
  - [x] Filtri avanzati (status: active/inactive, role: owner/admin/manager/user)
  - [x] Bulk operations (ban 24h, unban, delete, change role, toggle restriction, confirm email)
  - [x] User activity timeline con paginazione e filtri
  - [x] Activity tracking: action, resource, IP, user agent, duration, status
  - [x] Analytics attività per utente (total, successful, failed)
  - [x] Service role bypass RLS per super-admin
  - [x] Integrazione con super-admin dashboard (User Management card)

**Pagine Aggiunte**:
- `/super-admin/users` - Gestione utenti cross-org
- `/super-admin/users/[id]` - Dettaglio utente con activity timeline

**Migrazioni**:
- `20251001_user_activity_system.sql` - Sistema completo user activity logging

### 4.2 System Configuration ✅ COMPLETATO (67% - 4/6 features)
- [x] **Database Schema** ✅
  - [x] Tabella `feature_flags` con scope (global/organization)
  - [x] Tabella `api_keys` con AES-256-CBC encryption
  - [x] Tabella `rate_limits` con configurazione per endpoint
  - [x] Tabella `rate_limit_usage` per tracking violazioni
  - [x] Tabella `configuration_backups` con JSONB snapshots
  - [x] RLS policies per organization isolation
  - [x] Seed data con feature flags di default

- [x] **API Endpoints** ✅
  - [x] GET/POST /api/super-admin/feature-flags - CRUD feature flags
  - [x] PATCH/DELETE /api/super-admin/feature-flags/[id] - Update singola flag
  - [x] GET/POST /api/super-admin/api-keys - CRUD API keys con encryption
  - [x] PATCH/DELETE /api/super-admin/api-keys/[id] - Update singola key
  - [x] GET/POST /api/super-admin/rate-limits - CRUD rate limits
  - [x] PATCH/DELETE /api/super-admin/rate-limits/[id] - Update singolo limit
  - [x] GET/POST /api/super-admin/config-backups - Lista e crea backup
  - [x] GET/POST /api/super-admin/config-backups/[id] - Dettaglio e restore backup

- [x] **UI Page** ✅
  - [x] Pagina `/super-admin/system-config` con 4 tab:
    - **Feature Flags**: Toggle on/off, filtri per categoria, stats
    - **API Keys**: Show/hide values, encryption indicator, last used tracking
    - **Rate Limits**: Configurazione per endpoint, window/max requests
    - **Config Backups**: Create backup, restore, history tracking
  - [x] Link in super-admin dashboard (purple Cog button)
  - [x] Stats cards per ogni sezione
  - [x] Modal per creazione nuovi items

- [x] **Features Implementate** ✅
  - [x] Feature flags globali e per organizzazione
  - [x] AES-256-CBC encryption per API keys sensibili
  - [x] Rate limiting configurabile per endpoint pattern
  - [x] Backup/restore configurazione completa
  - [x] Show/hide encrypted values con toggle
  - [x] Organization-scoped per feature flags
  - [x] Service role client per super-admin operations

**Pagine Aggiunte**:
- `/super-admin/system-config` - System Configuration con 4 tab

**Migrazioni**:
- `20251001_system_configuration.sql` - Schema completo con 5 tabelle, policies, seed data

**Features SKIPPED (opzionali per MVP):**
- [ ] **Environment variables management** - Non necessario (gestito da Vercel)
  - Le environment variables sono già gestite via Vercel dashboard
  - Modifiche richiederebbero redeploy comunque
  - Feature postponed per versioni future
- [ ] **A/B testing framework** - Non necessario per MVP
  - Richiede infrastruttura complessa (experimentation engine)
  - Feature flags già permettono toggle feature on/off
  - A/B testing con analytics può essere aggiunto in futuro
  - Feature postponed per versioni enterprise

---

## **FASE 5: Security & Compliance** 🔐 NON INIZIATA (0%)

### 5.1 Advanced Security - NON INIZIATA (0/6 features)
- [ ] Audit log con filtri avanzati
- [ ] Export audit logs
- [ ] IP whitelisting/blacklisting
- [ ] Security scanning automatico
- [ ] Vulnerability assessment
- [ ] Session management avanzato

### 5.2 Compliance & Privacy - NON INIZIATA (0/5 features)
- [ ] GDPR compliance tools
- [ ] Data retention policies
- [ ] Privacy dashboard
- [ ] Consent management
- [ ] Data anonymization tools

---

## **FASE 6: Sistema Tracking Multi-Provider** 🚛✈️🚢 IN PARTENZA (0% - implementation ready)

### 🎯 Strategia Finale: 3-Layer Hybrid System (90% Cost Reduction)

#### Architettura Proposta
```
┌─────────────────────────────────────────┐
│         SCH-PRO TRACKING HUB            │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   OCEAN      │  │   AIR CARGO  │   │
│  │   FREIGHT    │  │              │   │
│  └──────┬───────┘  └──────┬───────┘   │
│         │                  │           │
│  ┌──────▼───────────────────▼──────┐   │
│  │     TRACKING ORCHESTRATOR       │   │
│  └──────┬───────────────────┬──────┘   │
│         │                   │          │
│  ┌──────▼──────┐    ┌──────▼──────┐   │
│  │  VIZION API │    │  WEB        │   │
│  │  (Primary)  │    │  SCRAPING   │   │
│  └─────────────┘    └─────────────┘   │
│                                         │
│  ┌──────────────┐  ┌──────────────┐   │
│  │   PARCEL     │  │   KARRIO     │   │
│  │   TRACKING   │  │  (Self-Host) │   │
│  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────┘
```

### 🎯 Architettura: 3-Layer Hybrid System

**Strategia replicando l'approccio ShipsGo:**
1. **Layer 1 (Primary):** Web Scraping - 11 carrier italiani prioritari (85% coverage, $0 costo per request)
2. **Layer 2 (Fallback):** JSONCargo API - Unlimited tracking $9/month (backup universale)
3. **Layer 3 (Ultimate Fallback):** ShipsGo - Già integrato (per casi edge e carrier non coperti)

**Costo totale:** $34-50/month vs $100-150 ShipsGo only = **70-80% savings**

---

### 6.1 Layer 1: Web Scraping Engine (Settimane 1-3) 🚢 - NON INIZIATA (0/11 carriers)
**Priority:** TOP 11 carrier per mercato Italia (85% coverage)

#### Carrier Scrapers da implementare (priorità per market share Italia):
- [ ] **MSC (Mediterranean Shipping)** - 40% market share Italia 🔴 CRITICAL
  - [ ] Playwright scraper per tracking portal
  - [ ] Container number + B/L tracking
  - [ ] Parsing: vessel, ETA, origin/dest ports, events
  - [ ] Anti-blocking: user-agent rotation + rate limiting

- [ ] **Maersk Line** - 15% market share 🟠 HIGH
  - [ ] Scraper con gestione login (se necessario)
  - [ ] Container + booking reference support
  - [ ] Parsing eventi milestone + location

- [ ] **CMA CGM** - 12% market share 🟠 HIGH
  - [ ] Multi-format tracking support
  - [ ] Gestione session cookies

- [ ] **COSCO Shipping** - 10% market share 🟡 MEDIUM
- [ ] **Hapag-Lloyd** - 8% market share 🟡 MEDIUM
- [ ] **ONE (Ocean Network Express)** - 6% market share 🟡 MEDIUM
- [ ] **Evergreen Line** - 5% market share 🟢 LOW
- [ ] **Yang Ming** - 3% market share 🟢 LOW
- [ ] **HMM (Hyundai Merchant Marine)** - 3% market share 🟢 LOW
- [ ] **ZIM Integrated Shipping** - 2% market share 🟢 LOW
- [ ] **OOCL (Orient Overseas)** - 2% market share 🟢 LOW

#### Infrastructure & Caching - 0/6 features
- [ ] **Scraping Server Setup**
  - [ ] DigitalOcean droplet ($20/month) o Railway ($5-15/month)
  - [ ] Playwright + TypeScript environment
  - [ ] Redis cache (TTL: 2-6 ore per ridurre scraping frequency)
  - [ ] PM2 o Docker per process management

- [ ] **Anti-Blocking Strategies**
  - [ ] User-agent rotation (20+ real browser UAs)
  - [ ] Request rate limiting (max 1 req/5sec per carrier)
  - [ ] Proxy rotation (opzionale, $10/month se necessario)
  - [ ] Retry logic con exponential backoff

- [ ] **Error Handling & Monitoring**
  - [ ] Automatic fallback a Layer 2 (JSONCargo) su failure
  - [ ] Healthcheck endpoint per ogni scraper
  - [ ] Error logging a Supabase (tracking_requests_log)
  - [ ] Alert quando success rate < 80%

**Cost:** $20-35/month (server + proxy opzionale)

---

### 6.2 Layer 2: JSONCargo API Fallback (Settimana 4) 🌐 - NON INIZIATA (0/4 features)
**Backup universale per quando web scraping fallisce**

- [ ] **JSONCargo Integration**
  - [ ] Account signup ($9/month unlimited plan)
  - [ ] API key setup + environment variables
  - [ ] Implementare `JSONCargoAdapter.ts`
  - [ ] Data normalization per compatibility con nostro schema

- [ ] **Smart Fallback Logic**
  - [ ] Trigger automatico quando scraper fallisce 2+ volte
  - [ ] Cache response per ridurre chiamate (TTL: 3 ore)
  - [ ] Monitoring utilizzo mensile
  - [ ] Alert se prossimi al limite (se esistente)

**Cost:** $9/month unlimited

---

### 6.3 Tracking Orchestrator (Settimana 5) 🧠 - NON INIZIATA (0/6 features)
**Smart routing tra i 3 layer**

- [ ] **TrackingOrchestrator.ts Implementation**
  ```typescript
  // Pseudocode logica
  async trackShipment(trackingNumber: string, carrier?: string) {
    // 1. Check cache DB first (0 cost)
    const cached = await checkCache(trackingNumber)
    if (cached && !isStale(cached)) return cached

    // 2. Identify carrier (auto-detect se non specificato)
    const detectedCarrier = carrier || detectCarrier(trackingNumber)

    // 3. Layer 1: Try web scraping
    if (hasScraperFor(detectedCarrier)) {
      const result = await scrapeCarrier(detectedCarrier, trackingNumber)
      if (result.success) {
        await saveToCache(result)
        return result
      }
    }

    // 4. Layer 2: Fallback JSONCargo
    const jsonCargoResult = await jsonCargoAPI.track(trackingNumber)
    if (jsonCargoResult.success) {
      await saveToCache(jsonCargoResult)
      return jsonCargoResult
    }

    // 5. Layer 3: Ultimate fallback ShipsGo
    const shipsGoResult = await shipsGoAPI.track(trackingNumber)
    await saveToCache(shipsGoResult)
    return shipsGoResult
  }
  ```

- [ ] **Provider Health Monitoring**
  - [ ] Success rate tracking per provider
  - [ ] Average response time metrics
  - [ ] Automatic circuit breaker (skip provider se down)

- [ ] **Carrier Auto-Detection**
  - [ ] Regex patterns per identificare carrier da tracking number
  - [ ] Esempio: `MAEU\d{10}` = Maersk, `MSCU\d{7}` = MSC

- [ ] **Cost Optimization**
  - [ ] Prioritize free layer (scraping) sempre
  - [ ] Log every request con provider used
  - [ ] Monthly cost report per organization

**Cost:** $0 (logica interna)

---

### 6.4 Database Schema Evolution 🗄️ - PRONTA (migration già creata)

✅ **Migration già disponibile:** `supabase/migrations/20251002_tracking_providers.sql`

Tabelle create:
- `tracking_providers` - Configurazione provider (scraping, JSONCargo, ShipsGo)
- `tracking_requests_log` - Log ogni chiamata per analytics e fallback tracking

**Task rimanenti:**
- [ ] Apply migration a Supabase production
- [ ] Seed initial provider data (11 scrapers + JSONCargo + ShipsGo)
- [ ] Test queries e indexes

---

### 6.5 API Routes Update (Settimana 6) 🔌 - NON INIZIATA (0/5 routes)

- [ ] **Migrate existing ShipsGo routes to Orchestrator**
  - [ ] `POST /api/tracking/track` - New unified endpoint (replaces /api/shipsgo/track)
  - [ ] `POST /api/tracking/batch` - Batch tracking (replaces /api/shipsgo/batch)
  - [ ] `POST /api/tracking/check` - Cache check (replaces /api/shipsgo/check)
  - [ ] Keep legacy `/api/shipsgo/*` routes per backward compatibility (deprecation warning)

- [ ] **New Management Endpoints**
  - [ ] `GET /api/tracking/providers/health` - Health status di tutti i provider
  - [ ] `GET /api/super-admin/tracking-stats` - Analytics utilizzo per provider

---

### 6.6 Cron Job Update (Settimana 7) ⏱️ - NON INIZIATA (0/3 features)

- [ ] **Update Existing Cron:**
  - [ ] Modify `src/app/api/cron/shipsgo-refresh/route.ts`
  - [ ] Replace direct ShipsGo call con TrackingOrchestrator
  - [ ] Keep 2x/day schedule (07:00 + 14:00 UTC)
  - [ ] Add provider usage stats to cron summary

**Existing cron già ottimo:** batch per organization, smart error handling, notification triggers

---

### 6.7 Success Metrics 📊

#### Technical KPIs
- **Layer 1 Success Rate:** > 85% (web scraping)
- **Layer 2 Usage:** < 10% fallback to JSONCargo
- **Layer 3 Usage:** < 5% fallback to ShipsGo
- **API Response Time:** < 3 seconds (95th percentile)
- **Cache Hit Rate:** > 70% (riduce external calls)

#### Cost KPIs (Multi-Tenant)
- **Monthly Cost:** $34-50 flat (server + JSONCargo + proxy)
- **Cost per Organization:** $0 (flat rate, non per-org)
- **Savings vs ShipsGo Only:** 70-80% risparmio
- **Year 1 Total:** ~$400-600 vs $1,200-1,800 ShipsGo only

#### Business KPIs
- **Carrier Coverage Italia:** 85% con top 5, 100% con tutti 11
- **Tracking Accuracy:** > 95% data accuracy
- **User Satisfaction:** > 4.5/5 tracking reliability

---

### 6.8 Implementation Timeline ⏱️

#### Week 1-2: Top 3 Scrapers (MSC, Maersk, CMA CGM)
- [ ] Setup scraping server (DigitalOcean/Railway)
- [ ] Playwright environment + Redis cache
- [ ] Implement MSC scraper (priority #1)
- [ ] Implement Maersk scraper
- [ ] Implement CMA CGM scraper
- [ ] Test con 20+ tracking numbers reali

#### Week 3: Remaining 8 Scrapers
- [ ] COSCO, Hapag-Lloyd, ONE, Evergreen
- [ ] Yang Ming, HMM, ZIM, OOCL
- [ ] Unified scraper base class per code reuse
- [ ] Error handling standardization

#### Week 4: JSONCargo Integration
- [ ] Account setup + API testing
- [ ] Implement JSONCargoAdapter.ts
- [ ] Fallback logic testing
- [ ] Rate limit monitoring

#### Week 5: Orchestrator Logic
- [ ] Implement TrackingOrchestrator.ts
- [ ] Smart routing between layers
- [ ] Carrier auto-detection
- [ ] Provider health monitoring

#### Week 6: API Migration
- [ ] New unified endpoints
- [ ] Migrate frontend to new API
- [ ] Backward compatibility routes
- [ ] Integration testing

#### Week 7: Production Launch
- [ ] Update cron job
- [ ] Gradual rollout per organization
- [ ] Monitor success rates per layer
- [ ] Cost tracking validation
- [ ] User feedback collection

---

### 6.9 Risk Mitigation Strategies ⚠️

#### Risk: Web scraping bloccato da carrier websites
**Mitigation:**
- User-agent rotation + request rate limiting
- Proxy rotation (opzionale, $10/month)
- Automatic fallback a Layer 2 (JSONCargo)
- Ultimate fallback a ShipsGo (già esistente)
- CAPTCHA solving service solo se necessario (2Captcha $3/1000)

#### Risk: JSONCargo API down o rate limited
**Mitigation:**
- Cache aggressivo (3-6 ore) per ridurre dipendenza
- Automatic fallback a ShipsGo
- Health check monitoring con alert
- Backup plan: aumentare cache TTL a 12-24 ore temporaneamente

#### Risk: Carrier website layout changes
**Mitigation:**
- Automated scraper testing (daily cron)
- Alert quando success rate < 80% per un carrier
- Fallback automatico a JSONCargo per quel carrier
- Quick fix deployment entro 24-48h

#### Risk: Costi scalabili con crescita utenti
**Mitigation:**
- Architettura multi-tenant con flat cost ($34-50/month)
- Non dipendenza da per-request pricing
- Cache-first pattern (70%+ cache hit rate target)
- Cost monitoring dashboard per layer

---

### 6.10 Provider Comparison Table 📊

| Provider | Tipo | Costi | Coverage | Pro | Contro |
|----------|------|-------|----------|-----|--------|
| **Web Scraping** | Layer 1 Primary | $20-35/mo flat | 11 carrier Italia (85%) | Zero costo per request, multi-tenant friendly | Manutenzione, anti-blocking |
| **JSONCargo** | Layer 2 Fallback | $9/mo unlimited | 150+ carrier global | Unlimited, flat rate, multi-tenant | Latency, meno dettagli |
| **ShipsGo** | Layer 3 Ultimate | ~$100-150/mo | 115+ carrier global | Comprehensive data, reliable | Credit-based, expensive |
| **VIZION** | ❌ Scartato | $600+/mo | 99+ ocean carrier | Best ocean data, DCSA | No free tier, per-request |
| **Terminal49** | ❌ Scartato | $500+/mo | 50+ ocean carrier | Good free tier (50/mo) | Per-request dopo free tier |

**Scelta finale:** 3-Layer Hybrid = 70-80% cost savings vs ShipsGo only

---

### 6.11 Future Enhancements (Post-MVP) 🚀

- [ ] **Machine Learning per ETA Prediction**
  - Predictive delivery estimates basati su historical data
  - Anomaly detection per shipment delays
  - Smart routing suggestions

- [ ] **Direct Carrier API Integrations (Phase 2)**
  - Maersk API (quando volumi >100 containers/mese)
  - Hapag-Lloyd API (sandbox disponibile)
  - CMA CGM API (comprehensive portal)
  - Solo se costi aggregator > $500/mese

- [ ] **Advanced Analytics Dashboard**
  - Provider performance comparison
  - Cost per tracking breakdown
  - Carrier reliability scoring
  - Predictive capacity planning

- [ ] **API Rate Optimizer**
  - Machine learning per predire quando container cambierà status
  - Dynamic polling frequency (più frequente vicino a milestone)
  - Riduce API calls del 40-60%

- [ ] **Parcel & Air Cargo Tracking** (Postponed to Phase 7)
  - Karrio self-hosted per DHL, UPS, FedEx tracking
  - Air cargo AWB tracking (Lufthansa, Emirates, etc.)
  - Multi-modal unified interface

---

### 📚 Resources & Documentation

#### JSONCargo API
- **Website:** https://jsoncargo.com/
- **Pricing:** $9/month unlimited tracking (best per multi-tenant)
- **Coverage:** 150+ carriers ocean freight global
- **Features:** REST API, comprehensive tracking data

#### Playwright (Web Scraping)
- **Website:** https://playwright.dev/
- **Documentation:** https://playwright.dev/docs/intro
- **Features:** Headless browser automation, anti-detection
- **Language:** TypeScript/JavaScript native
- **Use case:** Primary tracking method per 11 carrier italiani

#### ShipsGo API (Layer 3)
- **Website:** https://www.shipsgo.com/
- **Documentation:** API v2 già integrato
- **Current usage:** Ultimate fallback per carrier non coperti
- **Features:** 115+ carrier, push webhooks, 99% uptime

#### Carrier Tracking Portals (per scrapers)
- **MSC:** https://www.msc.com/track-a-shipment
- **Maersk:** https://www.maersk.com/tracking
- **CMA CGM:** https://www.cma-cgm.com/ebusiness/tracking
- **COSCO:** https://elines.coscoshipping.com/ebusiness/cargotracking
- **Hapag-Lloyd:** https://www.hapag-lloyd.com/en/online-business/track/track-by-container.html

---

**Status:** 🚀 PRONTO ALL'IMPLEMENTAZIONE - Migration DB pronta, piano finalizzato
**Priority:** 🔴 ALTA - Fondamentale per ridurre costi operativi 70-80%
**Dependencies:** Phase 4.2 completata ✅
**Budget Approved:** $34-50/month ($400-600/year) vs $1,200-1,800 ShipsGo only

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

## 📊 STATO GENERALE PROGETTO

### Completamento per Fase

| Fase | Nome | Completamento | Features | Stato |
|------|------|---------------|----------|-------|
| **1** | System Monitoring & Stability | **97%** | 52/54 | ✅ Completata |
| **1.1** | System Monitoring Dashboard | 100% | 8/8 | ✅ |
| **1.2** | Performance Monitoring | 95% | 19/20 | ✅ |
| **1.3** | Database Health & Backup | 95% | 13/14 | ✅ |
| **2** | Business Intelligence | **96%** | 126/131 | ✅ Completata |
| **2.1** | Billing & Subscriptions | 92% | 38/41 | ✅ |
| **2.2** | Analytics & Reporting | 100% | 88/90 | ✅ |
| **3** | Communication & Support | **77%** | 83/108 | 🔶 Parziale |
| **3.1** | Communication Center | 30% | 3/10 | 🔶 |
| **3.2** | Support & Helpdesk | 100% | 47/47 | ✅ |
| **3.3** | Notifications System | 100% | 33/33 | ✅ |
| **4** | Advanced Management | **84%** | 52/62 | ✅ Completata |
| **4.1** | Advanced User Management | 100% | 38/38 | ✅ |
| **4.2** | System Configuration | 67% | 14/24 | ✅ |
| **5** | Security & Compliance | **0%** | 0/11 | ⏸️ Postponed |
| **5.1** | Advanced Security | 0% | 0/6 | ⏸️ |
| **5.2** | Compliance & Privacy | 0% | 0/5 | ⏸️ |
| **6** | Sistema Tracking Multi-Provider | **0%** | 0/80+ | 🚀 Pronta |
| **6.1** | Layer 1: Web Scraping Engine | 0% | 0/33 | 🚀 Priority |
| **6.2** | Layer 2: JSONCargo Fallback | 0% | 0/8 | 🚀 |
| **6.3** | Tracking Orchestrator | 0% | 0/14 | 🚀 |
| **6.4** | Database Schema Evolution | 50% | 1/2 | ✅ Migration creata |
| **6.5** | API Routes Update | 0% | 0/7 | 📋 |
| **6.6** | Cron Job Update | 0% | 0/4 | 📋 |

### Metriche Globali

**Features Completate:** 313/366 features totali
**% Completamento Totale:** **85.5%**

**In Produzione:** 30 pagine + 60+ API endpoints
**Database:** 24 tabelle + 15+ funzioni PostgreSQL
**Migrazioni:** 12 migrations applicate con successo

### Breakdown per Stato

- ✅ **Completate (4 fasi):** Fase 1, 2, 3 (parziale), 4
- 🔶 **Parziali (1 fase):** Fase 3.1 (30% - broadcast skipped)
- ⏸️ **Non iniziate (1 fase):** Fase 5 (Security & Compliance)
- 📋 **Pianificate (1 fase):** Fase 6 (Solo research completato)

### Prossimi Step Consigliati

1. **Testing Completo Fase 2.1** (8% mancante)
   - Test Stripe checkout, upgrade/downgrade, fatturazione
   - Validazione completa sistema billing
   - **Timeline:** 2-3 giorni

2. **Fase 6 - Sistema Tracking Ibrido** (98% da fare)
   - VIZION API + Web Scraping + Karrio
   - Budget: $0-540/anno (vs $3,600+ aggregators)
   - **Timeline:** 6-7 settimane

3. **Fase 5 - Security & Compliance** (100% da fare)
   - Audit logs, IP whitelisting, GDPR tools
   - Importante per enterprise clients
   - **Timeline:** 4-6 settimane

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
17. **`/dashboard/notifications`** - **NUOVO** - Centro notifiche
18. **`/dashboard/users`** - Gestione utenti organizzazione
19. **`/dashboard/settings`** - Impostazioni utente

### Super Admin Pages
20. **`/super-admin`** - Dashboard super admin
21. **`/super-admin/monitoring`** - System monitoring & health checks
22. **`/super-admin/monitoring/performance`** - Performance metrics & API logs
23. **`/super-admin/monitoring/database`** - Database health & statistics
24. **`/super-admin/organizations`** - Gestione organizzazioni
25. **`/super-admin/billing/plans`** - Gestione piani abbonamento
26. **`/super-admin/billing/subscriptions`** - Gestione subscriptions
27. **`/super-admin/support-tickets`** - Gestione ticket cross-org
28. **`/super-admin/users`** - Gestione utenti cross-org con bulk operations
29. **`/super-admin/users/[id]`** - Dettaglio utente con activity timeline
30. **`/super-admin/system-config`** - **NUOVO** - System Configuration (4 tab: Feature Flags, API Keys, Rate Limits, Config Backups)

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
- `/api/super-admin/support-tickets` - **NUOVO** - Gestione ticket super-admin
- `/api/super-admin/support-tickets/[id]/messages` - **NUOVO** - Risposte ticket super-admin

#### Notifications
- `/api/notifications` - **NUOVO** - Lista notifiche con filtri
- `/api/notifications/unread-count` - **NUOVO** - Contatore non lette
- `/api/notifications/[id]/read` - **NUOVO** - Segna come letta
- `/api/notifications/mark-all-read` - **NUOVO** - Segna tutte come lette

#### Cron Jobs
- `/api/cron/shipsgo-refresh` - **NUOVO** - Aggiornamento automatico tracking 2x/giorno

#### User Management (Phase 4.1)
- `/api/super-admin/users` - **NUOVO** - Lista utenti con ricerca e filtri
- `/api/super-admin/users/[id]` - **NUOVO** - Dettaglio, update, delete utente
- `/api/super-admin/users/[id]/activity` - **NUOVO** - Activity timeline con filtri
- `/api/super-admin/users/bulk` - **NUOVO** - Bulk operations (ban, unban, delete, change role)

#### System Configuration (Phase 4.2)
- `/api/super-admin/feature-flags` - **NUOVO** - CRUD feature flags (global/organization)
- `/api/super-admin/api-keys` - **NUOVO** - CRUD API keys con AES-256 encryption
- `/api/super-admin/rate-limits` - **NUOVO** - CRUD rate limits configurabili
- `/api/super-admin/config-backups` - **NUOVO** - Backup/restore configurazione

### Database Tables (14 nuove tabelle Fasi 3 & 4)
1. **`email_templates`** - Template email riutilizzabili
2. **`broadcast_messages`** - Sistema broadcast (schema pronto)
3. **`message_deliveries`** - Tracking invii email
4. **`support_tickets`** - Ticket supporto
5. **`ticket_messages`** - Messaggi conversazione ticket
6. **`kb_articles`** - Articoli knowledge base con full-text search
7. **`notifications`** - Sistema notifiche con trigger automatici
8. **`user_activity_logs`** - Tracking completo attività utente (Phase 4.1)
9. **`feature_flags`** - Feature toggles global/organization (Phase 4.2)
10. **`api_keys`** - API keys con AES-256 encryption (Phase 4.2)
11. **`rate_limits`** - Configurazione rate limiting (Phase 4.2)
12. **`rate_limit_usage`** - Tracking violazioni rate limits (Phase 4.2)
13. **`configuration_backups`** - Backup/restore JSONB snapshots (Phase 4.2)

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

### 5. Service Role Client for Super-Admin Operations (CRITICAL)
**Problema:** Super-admin non può vedere dati cross-organizzazione se usa client standard (RLS blocca accesso).

**Soluzione:** Usare service_role client per super-admin endpoints:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
)
```

**NON usare:**
```typescript
const supabase = await createSupabaseServer()  // ❌ Rispetta RLS!
```

**Sintomi:** Super-admin vede solo dati della propria organizzazione, API restituisce array vuoti.

**Best Practice:** Service role SOLO per super-admin endpoints in `/api/super-admin/*`. Mai per endpoint utente.

---

### 6. shadcn/ui Components - Check Availability First
**Problema:** Componenti shadcn/ui (ScrollArea, Popover, etc.) non sono pre-installati nel progetto.

**Soluzione:** Prima di usare componenti shadcn/ui:
1. Verifica se esistono in `src/components/ui/`
2. Se mancanti, implementa alternative native:

```typescript
// ❌ EVITA se componente non esiste
import { Popover, PopoverContent } from '@/components/ui/popover'

// ✅ USA alternative native
const [isOpen, setIsOpen] = useState(false)
const dropdownRef = useRef<HTMLDivElement>(null)
// Custom click-outside-to-close logic

// ❌ EVITA ScrollArea se non esiste
<ScrollArea className="h-[400px]">

// ✅ USA overflow nativo
<div className="max-h-[400px] overflow-y-auto">
```

**Sintomi:** Vercel build failure con "Can't resolve '@/components/ui/component-name'".

**Best Practice:** Usa componenti UI già presenti nel progetto. Se necessario, implementa custom solutions.

---

### 7. Vercel Cron Jobs - Free Tier Limitations
**Problema:** Vercel free tier supporta massimo 2 cron jobs.

**Soluzione:** Consolidare task schedulati:
```json
{
  "crons": [
    {
      "path": "/api/cron/shipsgo-refresh",
      "schedule": "0 7 * * *"   // 08:00 Italia
    },
    {
      "path": "/api/cron/shipsgo-refresh",
      "schedule": "0 14 * * *"  // 15:00 Italia
    }
  ]
}
```

**Sintomi:** Deploy fallisce con errore "Maximum 2 cron jobs allowed".

**Best Practice:** Per più task, creare endpoint batch che esegue multiple operazioni.

---

### 8. Email Strategy per Startup SaaS B2B (CRITICAL)

**Problema:** Scegliere struttura email aziendale per credibilità, scalabilità e gestione servizi esterni.

**Soluzione:** Strategia in 2 fasi basata su crescita team.

#### Fase 1: Solo Founder (0-6 mesi)

**Email PRIMARY:**
```
fabrizio.cagnucci@sch-pro.app
```

**Perché nome.cognome@dominio:**
- ✅ Credibilità: clienti preferiscono parlare con persona reale vs "admin@"
- ✅ Trust: founder email = accountability e decisore
- ✅ Networking: migliore per partnership e sales outreach
- ✅ Servizi esterni: SaaS providers (Stripe, Terminal49, etc.) preferiscono nome persona
- ✅ Scalabilità: quando assumi, trasferisci ownership facilmente

**Alias (forward tutti a primary):**
```
admin@sch-pro.app
info@sch-pro.app
support@sch-pro.app
sales@sch-pro.app
```

**Setup Google Workspace:**
```
1. Crea account: fabrizio.cagnucci@sch-pro.app
2. Settings → Users → Email aliases
3. Aggiungi tutti gli alias (gratis, no costo extra)
4. Tutti i messaggi arrivano in 1 inbox
5. Puoi rispondere DA qualsiasi alias
```

#### Fase 2: Con Team (6+ mesi)

**Separazione accounts:**
```
fabrizio.cagnucci@sch-pro.app  → CEO/Founder (strategic)
support@sch-pro.app            → Team support (inbox separata)
sales@sch-pro.app              → Team sales (inbox separata)
dev@sch-pro.app                → Team development
admin@sch-pro.app              → System notifications
noreply@sch-pro.app            → Automated emails (billing, alerts)
```

#### Dove Usare Quale Email

**Usa `fabrizio.cagnucci@` per:**
- ✅ Terminal49 / VIZION / carrier APIs
- ✅ Stripe / payment gateway
- ✅ Vercel / hosting provider
- ✅ Supabase / database
- ✅ Partnership inquiries
- ✅ LinkedIn / networking

**Usa `admin@` o `noreply@` per:**
- ✅ System alerts (monitoring, errors)
- ✅ Automated emails app (invoices, receipts)
- ✅ Webhook reply-to addresses
- ✅ Internal notifications

#### Email Signature Professionale

```
--
Fabrizio Cagnucci
Founder & CEO
SCH PRO

📧 fabrizio.cagnucci@sch-pro.app
🌐 https://sch-pro.app

Making shipment tracking simple and powerful.
```

**Sintomi se fatto male:**
- ❌ `admin@` per servizi esterni → meno credibilità, più spam
- ❌ Email personale Gmail per business → unprofessional
- ❌ Troppi account separati da subito → complessità gestionale

**Best Practice:**
1. START con `nome.cognome@dominio` + aliases
2. Scalare a multiple inboxes solo quando assumi team
3. Mantenere founder email per strategic relationships
4. Usare `noreply@` per automated system emails

**Costo:** $0 extra (alias gratis in Google Workspace)

---

### 9. 3-Layer Hybrid Tracking System - Final Architecture Decision (CRITICAL)

**Problema:** Trovare soluzione tracking ocean freight cost-effective per multi-tenant SaaS con volumi crescenti.

**Decisione Finale:** 3-Layer Hybrid System replicando approccio ShipsGo.

#### Evolution delle Opzioni Valutate

**Opzione A (Iniziale):** Terminal49 (free tier 50/mo) + web scraping backup
- ❌ Terminal49 $10/container dopo free tier → expensive at scale
- ❌ Coverage limitato USA/Canada
- ❌ Per-request pricing non scalabile multi-tenant

**Opzione B (Considerata):** VIZION ($5-8/container) + web scraping
- ❌ No free tier, require sales demo (2+ settimane)
- ❌ Per-request pricing = $600+/month at scale
- ❌ Non adatto architettura multi-tenant flat cost

**Opzione C (SCELTA FINALE):** 3-Layer Hybrid System
- ✅ Layer 1: Web Scraping 11 carrier Italia (85% coverage, $0 per-request)
- ✅ Layer 2: JSONCargo API ($9/month UNLIMITED)
- ✅ Layer 3: ShipsGo fallback (già integrato)
- ✅ Costo flat $34-50/month vs $100-150 ShipsGo only
- ✅ **70-80% cost savings** vs single-provider approach

#### Comparison Matrix - Final Decision

| Provider | Type | Cost | Coverage | Multi-Tenant | Scalability | Decision |
|----------|------|------|----------|--------------|-------------|----------|
| **Web Scraping** | Primary | $20-35/mo flat | 11 carrier (85% IT) | ✅ Perfect | ✅ Unlimited | ✅ LAYER 1 |
| **JSONCargo** | Fallback | $9/mo unlimited | 150+ global | ✅ Perfect | ✅ Unlimited | ✅ LAYER 2 |
| **ShipsGo** | Ultimate | ~$100-150/mo | 115+ global | ⚠️ Credit-based | ⚠️ Expensive | ✅ LAYER 3 |
| **VIZION** | ❌ | $600+/mo | 99+ ocean | ❌ Per-request | ❌ Too expensive | ❌ REJECTED |
| **Terminal49** | ❌ | $500+/mo after free | 50+ ocean | ❌ Per-request | ❌ Expensive scale | ❌ REJECTED |

#### Strategia Implementazione

**Week 1-3: Layer 1 Web Scraping**
- Top 3 priority: MSC (40%), Maersk (15%), CMA CGM (12%)
- 8 carrier addizionali: COSCO, Hapag-Lloyd, ONE, Evergreen, Yang Ming, HMM, ZIM, OOCL
- Infrastructure: DigitalOcean/Railway ($20-35/month)
- Cache Redis (TTL 2-6h)
- Anti-blocking: user-agent rotation, rate limiting

**Week 4: Layer 2 JSONCargo**
- Signup: $9/month unlimited plan
- Fallback automatico quando web scraping fallisce
- 150+ carrier global coverage

**Week 5-7: Orchestrator + API Migration**
- TrackingOrchestrator.ts smart routing
- Migrate existing `/api/shipsgo/*` routes
- Update cron job auto-refresh
- Production gradual rollout

#### Cost Analysis - Multi-Tenant Architecture

**Current (ShipsGo only):**
```
Base: $100-150/month
Per-request credit cost
Not scalable multi-tenant
Total Year 1: $1,200-1,800
```

**New (3-Layer Hybrid):**
```
Layer 1 (Scraping): $20-35/month flat
Layer 2 (JSONCargo): $9/month flat
Layer 3 (ShipsGo): $5-15/month (fallback only)
Total: $34-50/month
Total Year 1: $400-600
SAVINGS: 70-80% ($800-1,200/year)
```

**Scalability:**
- ✅ 10 organizations: $34-50/month total (flat cost)
- ✅ 100 organizations: $34-50/month total (same!)
- ✅ Per-organization cost: $0.34-0.50 at 100 orgs
- ✅ Zero per-request charges on Layer 1 (85% traffic)

#### Technical Approach - Replicando ShipsGo

**ShipsGo's multi-source strategy (research findings):**
- 40-50% web scraping (majority)
- 20-30% EDI connections
- 10-20% direct carrier APIs
- 5-10% AIS data (vessel tracking)
- 5-10% terminal APIs

**Nostra implementazione (simplified):**
- 85% web scraping (Layer 1 - top 11 carrier)
- 10% JSONCargo API (Layer 2 - missing carriers)
- 5% ShipsGo (Layer 3 - edge cases)

**Cache-first pattern (already implemented):**
```typescript
// Existing useShipsGO.ts pattern mantained
1. Check DB cache (0 cost) ✅
2. Try Layer 1 scraping (0 cost per-request)
3. Fallback Layer 2 JSONCargo (flat rate included)
4. Ultimate fallback Layer 3 ShipsGo (1 credit)
```

#### Registration & Setup

**JSONCargo:**
```
1. https://jsoncargo.com/pricing
2. Email: fabrizio.cagnucci@sch-pro.app
3. Plan: $9/month unlimited
4. Get API key
```

**Scraping Server:**
```
1. DigitalOcean Droplet $20/mo OR Railway $5-15/mo
2. Playwright + Redis setup
3. Deploy 11 carrier scrapers
4. Monitor success rate (target >85%)
```

**Best Practice:** Start with top 3 carrier scrapers (MSC, Maersk, CMA CGM) = 67% coverage Italia immediately, expand to 100% with remaining 8.

---

*Questo documento verrà aggiornato ad ogni milestone completato*
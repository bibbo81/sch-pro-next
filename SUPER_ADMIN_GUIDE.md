# 🔐 Super Admin Guide

## Come Accedere come Super Admin

### Metodo 1: Portal Web Segreto
1. Vai a: `http://localhost:3002/secret-admin-portal-xyz789`
2. Inserisci la tua email (quella con cui hai fatto login)
3. Inserisci uno dei codici di attivazione:
   - `SUPER_ADMIN_2024_ACTIVATE_XYZ789`
   - `EMERGENCY_ACCESS_ADMIN_2024`
   - `OWNER_MASTER_KEY_2024`
4. Clicca "Activate Super Admin Access"
5. Verrai reindirizzato al dashboard Super Admin

### Metodo 2: Database Diretto (SQL)
Se hai accesso diretto al database Supabase:

```sql
-- Promuovere un utente a super admin (sostituisci con la tua email)
SELECT public.promote_user_to_super_admin('tua-email@example.com');

-- Vedere tutti i super admin
SELECT * FROM public.list_super_admins();

-- Rimuovere super admin status (se necessario)
SELECT public.demote_super_admin('user-email@example.com');
```

### Metodo 3: Inserimento Manuale Database
```sql
-- Trova il tuo user ID
SELECT id, email FROM auth.users WHERE email = 'tua-email@example.com';

-- Inserisci nella tabella super_admins (sostituisci YOUR-USER-ID)
INSERT INTO public.super_admins (user_id, notes)
VALUES ('YOUR-USER-ID-HERE', 'Initial super admin setup');
```

## Funzionalità Super Admin

### Dashboard Super Admin (`/super-admin`)
- **Statistiche Globali**: Vedi tutte le organizzazioni, utenti, spedizioni
- **Gestione Organizzazioni**: Crea, modifica, elimina organizzazioni clienti
- **Audit Log**: Vedi tutte le azioni amministrative

### Creazione Nuova Organizzazione
1. Vai a `/super-admin/organizations/new`
2. Inserisci nome organizzazione
3. Crea il primo admin con email e password
4. L'admin riceverà le credenziali per accedere

### Gestione Organizzazioni
- **Visualizza**: Tutti i dettagli di ogni organizzazione
- **Modifica**: Nome e descrizione organizzazioni
- **Elimina**: ⚠️ ATTENZIONE - Elimina TUTTI i dati (utenti, spedizioni, prodotti)

## Sicurezza

### URL Segreto
- L'URL `/secret-admin-portal-xyz789` è nascosto
- Non appare in nessun menu o link
- Solo tu conosci questo percorso

### Codici di Attivazione
Cambia questi codici nel file:
`/src/app/api/super-admin/activate/route.ts`

```javascript
const ACTIVATION_CODES = [
  'TUO_CODICE_PERSONALIZZATO_2024',
  'ALTRO_CODICE_SICURO',
  // Aggiungi i tuoi codici
]
```

### Controllo Accessi
- Tutte le route `/super-admin/*` sono protette
- Tutte le API `/api/super-admin/*` richiedono super admin
- Gli utenti normali NON vedono nessun riferimento al super admin

## Workflow Operativo

### 1. Setup Iniziale
1. Attiva il tuo account super admin
2. Vai su `/super-admin`
3. Verifica che tutto funzioni

### 2. Creare una Nuova Azienda Cliente
1. Vai su `/super-admin/organizations/new`
2. Inserisci dati azienda (es. "Azienda Rossi SRL")
3. Crea admin aziendale (es. admin@aziendarossi.it)
4. Comunica credenziali al cliente

### 3. Gestione Continua
- Monitor dashboard per statistiche
- Gestisci organizzazioni se necessario
- Controlla audit log per sicurezza

## File Importanti

### Configurazione
- `/src/app/api/super-admin/activate/route.ts` - Codici attivazione
- `/supabase/migrations/add_super_admin.sql` - Setup database
- `/src/lib/auth-super-admin.ts` - Funzioni controllo accessi

### UI/UX
- `/src/app/super-admin/` - Dashboard e pagine admin
- `/src/app/secret-admin-portal-xyz789/` - Portal attivazione

### Sicurezza
- Middleware automatico su tutte le route
- RLS policies nel database
- Audit logging automatico

## Troubleshooting

### Non riesco ad accedere
1. Verifica di essere loggato con l'account giusto
2. Controlla nel database se sei nella tabella `super_admins`
3. Usa il SQL diretto per promuoverti

### Errori nelle API
- Controlla i log del server
- Verifica che le migrazioni database siano applicate
- Assicurati che RLS policies siano attive

### Cambiare URL Segreto
1. Rinomina cartella `/secret-admin-portal-xyz789/`
2. Aggiorna eventuali riferimenti nel codice
3. Usa un nome ancora più sicuro/casuale

## ⚠️ ATTENZIONI

- **Mai condividere i codici di attivazione**
- **L'eliminazione organizzazioni è irreversibile**
- **Mantieni segreto l'URL del portal**
- **Monitora regolarmente l'audit log**
- **Backup del database prima di operazioni massive**
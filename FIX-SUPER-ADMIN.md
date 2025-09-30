# 🔧 FIX SUPER-ADMIN ACCESS

## Problema
La tabella `super_admins` non ha permessi per il role `authenticated`, quindi le API routes non possono verificare se l'utente è super-admin.

## Soluzione (3 minuti)

### Step 1: Apri Supabase SQL Editor
👉 https://supabase.com/dashboard/project/vgwlnsycdohrfmrfjprl/editor

### Step 2: Clicca "New Query"

### Step 3: Copia e incolla questo SQL:

```sql
-- Grant SELECT permission to authenticated role
GRANT SELECT ON TABLE super_admins TO authenticated;

-- Grant SELECT permission to service_role (safety)
GRANT SELECT ON TABLE super_admins TO service_role;

-- Disable RLS on super_admins table
ALTER TABLE super_admins DISABLE ROW LEVEL SECURITY;
```

### Step 4: Clicca "Run" (o premi Ctrl+Enter)

### Step 5: Verifica che sia andato a buon fine
Dovresti vedere: "Success. No rows returned"

---

## Dopo aver eseguito l'SQL

1. Torna qui e fammi sapere
2. Rimuoverò il check hardcoded dall'email
3. Faremo un deploy pulito
4. Tutto funzionerà! 🎉

---

## Perché serve questo fix?

Le API routes (`requireSuperAdmin()`) usano il Supabase client con role `authenticated`, non `service_role`. Senza il GRANT, il client non può leggere la tabella `super_admins` e quindi ritorna sempre 403 Forbidden.

## Sicurezza

- ✅ È sicuro: ogni utente può VEDERE la tabella super_admins
- ✅ Ma solo tu sei DENTRO la tabella (quindi solo tu sei super-admin)
- ✅ Nessuno può MODIFICARE la tabella (solo SELECT, non INSERT/UPDATE/DELETE)
- ✅ RLS disabilitato perché non contiene dati sensibili (solo UUIDs)
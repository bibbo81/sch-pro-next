# Sistema di Aggiornamento Automatico ShipsGo

## Panoramica

Il sistema aggiorna automaticamente le spedizioni 2 volte al giorno (alle 9:00 e alle 15:00 UTC) chiamando l'API ShipsGo per ottenere gli stati più recenti.

## Configurazione

### 1. Variabili d'Ambiente

Aggiungi queste variabili nel dashboard Vercel:

```env
SHIPSGO_API_KEY=your_shipsgo_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
CRON_SECRET=your_random_secret_string
```

Per generare `CRON_SECRET`, usa:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Deploy

Il file `vercel.json` configura automaticamente i cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/shipsgo-refresh",
      "schedule": "0 9,15 * * *"
    }
  ]
}
```

### 3. Test Manuale

Per testare il sistema senza aspettare:

```bash
# In sviluppo
curl http://localhost:3000/api/cron/test

# In produzione (con auth)
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
     https://your-app.vercel.app/api/cron/test
```

## Come Funziona

1. **Recupero Spedizioni**: Il cron job trova tutte le spedizioni con tracking_number che non sono consegnate
2. **Raggruppamento**: Raggruppa per organizzazione per ottimizzare le chiamate API
3. **Batch API**: Chiama `/api/shipsgo/batch` per ogni gruppo di tracking numbers
4. **Aggiornamento**: Aggiorna sia la tabella `shipments` che `trackings` con i nuovi dati
5. **Logging**: Registra tutti i risultati per il monitoraggio

## Monitoring

- I log sono visibili nel dashboard Vercel sotto "Functions"
- Ogni esecuzione logga: numero di spedizioni elaborate, aggiornamenti riusciti, errori
- Il sistema gestisce gracefully gli errori API e di database

## Stati Mappati

ShipsGo → Sistema Interno:
- `SAILING` → `in_transit`
- `DELIVERED` → `delivered`
- `PICKED_UP` → `in_transit`
- `DEPARTED` → `in_transit`
- `ARRIVED` → `arrived`
- `EXCEPTION` → `exception`
- `PENDING` → `pending`

## Sicurezza

- Il cron job richiede il token `CRON_SECRET` per l'autenticazione
- Solo le spedizioni non consegnate/cancellate vengono elaborate
- I dati sono isolati per organizzazione
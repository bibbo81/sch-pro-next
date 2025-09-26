# sch-pro-next

Gestione spedizioni, tracking e costi – Migrazione Next.js

---

## 🚀 Descrizione

Questa applicazione è la versione Next.js del sistema di gestione spedizioni, tracking, prodotti e costi.  
La UI è suddivisa in componenti React, con API serverless e supporto a esportazione dati, filtri avanzati e autenticazione.

---

## 📦 Funzionalità principali

- **Dashboard** con KPI, grafici e stato spedizioni
- **Gestione tracking**: aggiunta, lista, preview live
- **Gestione spedizioni**: filtri, dettagli, stato
- **Analisi costi prodotti** e performance compagnie/spedizionieri
- **Esportazione Excel** delle tabelle principali
- **Autenticazione** (NextAuth.js)
- **API serverless** (Next.js API routes)
- **UI responsive** (Tailwind CSS)

---

## 🛠️ Setup locale

1. **Clona la repo**
   ```bash
   git clone https://github.com/tuo-utente/sch-pro-next.git
   cd sch-pro-next
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   ```

3. **Configura le variabili ambiente**
   - Copia `.env.example` in `.env.local` e personalizza i valori

4. **Avvia il progetto**
   ```bash
   npm run dev
   ```

---

## 🗂️ Struttura principale

```
src/
  app/                # Pagine Next.js (routing)
  components/         # Componenti React riutilizzabili
  styles/             # Stili globali (Tailwind, CSS)
  hooks/              # Custom hooks
  utils/              # Helpers e utility
```

---

## 📑 Script utili

- `npm run dev` – Avvia in modalità sviluppo
- `npm run build` – Build di produzione
- `npm run start` – Avvia la build di produzione
- `npm run lint` – Lint del codice

---

## 📄 Licenza

MIT

---

> Progetto migrato e mantenuto da [fabriziocagnucci](https://github.com/fabriziocagnucci)
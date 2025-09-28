# 🔄 ROADMAP UPDATE GUIDE

## Come aggiornare la roadmap quando completiamo qualcosa:

### 1. Dire a Claude:
```
"Aggiorna ROADMAP.md: ho completato [nome feature]"
```

### 2. Claude automaticamente:
- ✅ Marca la feature come completata
- 📊 Aggiorna % completamento
- 📅 Aggiorna data ultima modifica
- 💾 Salva il file

### 3. Commit automatico:
```bash
git add ROADMAP.md
git commit -m "Update roadmap: completed [feature]"
git push
```

## Esempi di comandi utili:

### Per vedere lo stato:
```
"Qual è lo stato attuale della roadmap SCH Pro?"
"Quante features abbiamo completato della Fase 1?"
"Cosa dobbiamo fare dopo?"
```

### Per aggiornare:
```
"Segna come completato: System Monitoring Dashboard"
"Iniziamo la prossima feature della roadmap"
"Sposta [feature] da Fase 2 a Fase 1 (priorità alta)"
```

### Per pianificare:
```
"Qual è la prossima milestone da completare?"
"Stimami quanto tempo per completare Fase 1"
"Riorganizza le priorità della roadmap"
```
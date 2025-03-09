pour compiler le bot : 

```bash
npx tsc
```

pour lancer le bot : 

```bash
node dist/index.js
```

commandes ensemble : 

```bash
npx tsc && node dist/index.js
```

pour lancer le bot en mode persistant : 

```bash
pm2 start dist/index.js --name discord-bot
```
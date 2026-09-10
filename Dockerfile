# Utiliser une image de base Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Compiler le TypeScript si nécessaire (ajustez selon votre build)
RUN npm run build

# Exposer le port si nécessaire (exemple pour un bot Discord)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["npm", "start"]
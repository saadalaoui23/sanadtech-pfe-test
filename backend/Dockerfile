# Étape 1 : Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Compilation TypeScript vers JavaScript (crée le dossier dist/)
RUN npm run build

# Étape 2 : Production Runner (image plus légère)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# On récupère uniquement le dossier dist construit à l'étape précédente
COPY --from=builder /app/dist ./dist

# Variables d'environnement par défaut
ENV PORT=3000
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/index.js"]
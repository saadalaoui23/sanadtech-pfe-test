# Étape 1 : Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (y compris devDependencies pour TypeScript)
RUN npm install

# Copier tout le code source
COPY . .

# Compiler TypeScript vers JavaScript (génère le dossier dist/)
RUN npm run build

# Étape 2 : Production Runner (image plus légère)
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer UNIQUEMENT les dépendances de production
RUN npm install --only=production

# Copier le dossier dist compilé depuis l'étape builder
COPY --from=builder /app/dist ./dist

# Variables d'environnement par défaut
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# 🔴 CORRECTION ICI : Le point d'entrée est server.js, pas index.js !
CMD ["node", "dist/server.js"]
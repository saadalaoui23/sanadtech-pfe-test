# Étape 1 : Build de l'app React
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# On définit l'URL de l'API pour le build (Vite en a besoin au moment du build)
ENV VITE_API_URL=http://localhost:3000/api
RUN npm run build

# Étape 2 : Serveur Web Nginx
FROM nginx:alpine

# Copier le build React vers le dossier de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier notre configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
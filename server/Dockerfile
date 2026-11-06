FROM node:20-alpine

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

EXPOSE 5000

# Utilisation de nodemon (défini dans les scripts du package.json)
CMD ["npm", "run", "dev"]
# Etap 1: Budowanie aplikacji
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Ustawienie środowiska na deweloperskie, aby zainstalować devDependencies
ENV NODE_ENV=development

# Kopiowanie plików package.json i instalacja zależności
COPY package*.json ./
RUN npm install

# Kopiowanie reszty plików aplikacji
COPY . .

# Generowanie klienta Prisma
RUN npx prisma generate

# Budowanie aplikacji (kompilacja TypeScript do JavaScript)
RUN npm run build

# Etap 2: Uruchomienie aplikacji
FROM node:18-alpine

WORKDIR /usr/src/app

# Instalacja OpenSSL dla Prisma
RUN apk add --no-cache openssl3

# Kopiowanie zbudowanej aplikacji i zależności z etapu buildera
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/prisma ./prisma

# Kopiowanie i ustawienie skryptu startowego
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Ustawienie polecenia startowego
ENTRYPOINT ["./entrypoint.sh"]

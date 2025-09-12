# Dockerfile de producción para Express (Node 20)
FROM node:20-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

# Instalar dependencias (solo prod si hay lockfile)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile --prod; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile --production; \
  elif [ -f package-lock.json ]; then npm ci --omit=dev; \
  else npm i --omit=dev; fi

# Copiar código
COPY . .

# Asegurar que la app escuche en 0.0.0.0 y puerto 3000 por defecto
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000
CMD ["node","server.js"]

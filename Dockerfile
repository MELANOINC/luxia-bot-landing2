# Multi-stage Dockerfile for production
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN apk add --no-cache curl wget
ENV NODE_ENV=production
USER node
EXPOSE 3000
HEALTHCHECK CMD wget --spider -q http://localhost:3000/health || exit 1
CMD ["node", "server.js"]

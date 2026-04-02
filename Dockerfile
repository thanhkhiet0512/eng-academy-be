# =========================
# 1) Dependencies (dev — for build tools)
# =========================
FROM node:22-alpine AS deps

WORKDIR /app

# Force development so devDependencies (nest, typescript, etc.) are installed
ENV NODE_ENV=development

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci


# =========================
# 2) Builder
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/prisma ./prisma

COPY . .

RUN npx prisma generate && npm run build

# Prune dev deps in-place so runner stage gets a clean prod node_modules
RUN npm prune --omit=dev


# =========================
# 3) Runner
# =========================
FROM node:22-alpine AS runner

RUN apk add --no-cache wget

ENV NODE_ENV=production

RUN addgroup -g 1001 -S appgroup \
  && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

# =========================
# 1) Dependencies
# =========================
FROM node:22-alpine AS deps

RUN addgroup -g 1001 -S appgroup \
  && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown -R appuser:appgroup /app

ENV NODE_ENV=development

COPY --chown=appuser:appgroup package*.json ./
COPY --chown=appuser:appgroup prisma ./prisma/
COPY --chown=appuser:appgroup prisma.config.ts ./

USER appuser

RUN npm ci


# =========================
# 2) Builder
# =========================
FROM node:22-alpine AS builder

RUN addgroup -g 1001 -S appgroup \
  && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown -R appuser:appgroup /app

ENV NODE_ENV=development

COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=deps --chown=appuser:appgroup /app/package*.json ./
COPY --from=deps --chown=appuser:appgroup /app/prisma ./prisma

COPY --chown=appuser:appgroup . .

USER appuser

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev


# =========================
# 3) Runner
# =========================
FROM node:22-alpine AS runner

RUN apk add --no-cache curl wget

ENV NODE_ENV=production

RUN addgroup -g 1001 -S appgroup \
  && adduser -S appuser -u 1001 -G appgroup

WORKDIR /app
RUN chown -R appuser:appgroup /app

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=builder --chown=appuser:appgroup /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./

USER appuser

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health || exit 1

CMD ["sh", "-c", "npm run prisma:deploy && node dist/main"]

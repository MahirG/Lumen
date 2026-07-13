# Hisab Gold AI — Production Dockerfile
# Multi-stage build for Next.js 16 + Bun + realtime service

# === Stage 1: Install dependencies ===
FROM oven/bun:1 AS deps
WORKDIR /app

# Copy package manifests
COPY package.json bun.lock ./
COPY mini-services/realtime-service/package.json ./mini-services/realtime-service/package.json

# Install all deps
RUN bun install --frozen-lockfile
RUN cd mini-services/realtime-service && bun install --frozen-lockfile

# === Stage 2: Build ===
FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/mini-services/realtime-service/node_modules ./mini-services/realtime-service/node_modules
COPY . .

# Generate Prisma client
RUN bun run db:generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# === Stage 3: Runtime ===
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/mini-services ./mini-services
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create DB directory
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000 3003

# Start both Next.js and realtime service
CMD ["sh", "-c", "cd /app/mini-services/realtime-service && bun run start & /app/server.js"]

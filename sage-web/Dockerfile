# === SageAI Frontend — Multi-stage Production Build ===
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Stage 2: Build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment for build optimizations
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Production runner (standalone output)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 sageai && \
    adduser --system --uid 1001 sageai

# Copy standalone build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=sageai:sageai /app/.next/standalone ./
COPY --from=builder --chown=sageai:sageai /app/.next/static ./.next/static

USER sageai

EXPOSE 3000 8080

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; elif [ -f sage-web/server.js ]; then cd sage-web && node server.js; else npm start; fi"]


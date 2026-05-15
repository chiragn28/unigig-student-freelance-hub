# =========================================================================
# Server production image — multi-stage, minimal runtime.
# Use this when self-hosting (Fly.io, Render Docker target, your own VM).
# Vercel/Railway can also detect Node directly without Docker.
# =========================================================================

# ---- Stage 1: builder ----
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++ openssl libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install all deps including dev (needed for tsc build).
# Rebuild bcrypt's native binary since we skipped scripts.
RUN npm ci --ignore-scripts && npm rebuild bcrypt --build-from-source

COPY server ./server

# Dummy DATABASE_URL satisfies Prisma's schema validation at build time.
# The real one is injected at runtime via the platform's env vars.
ENV DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy?schema=public"
RUN cd server && npx prisma generate
RUN npm run build -w server

# ---- Stage 2: runtime ----
FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Production deps only; rebuild bcrypt's native binary.
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev --ignore-scripts \
    && npm rebuild bcrypt --build-from-source \
    && apk del .build-deps

# Copy the compiled server + Prisma artifacts
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app/server

EXPOSE 4000

# Run pending migrations, then start the API.
# Idempotent — safe to run on every container start.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

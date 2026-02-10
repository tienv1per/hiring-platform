# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for public env vars (baked at build time)
ARG NEXT_PUBLIC_AUTH_URL=http://localhost:8001
ARG NEXT_PUBLIC_USER_URL=http://localhost:8002
ARG NEXT_PUBLIC_JOB_URL=http://localhost:8003
ARG NEXT_PUBLIC_UTILITY_URL=http://localhost:8004
ARG NEXT_PUBLIC_BLOG_URL=http://localhost:8005

ENV NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL
ENV NEXT_PUBLIC_USER_URL=$NEXT_PUBLIC_USER_URL
ENV NEXT_PUBLIC_JOB_URL=$NEXT_PUBLIC_JOB_URL
ENV NEXT_PUBLIC_UTILITY_URL=$NEXT_PUBLIC_UTILITY_URL
ENV NEXT_PUBLIC_BLOG_URL=$NEXT_PUBLIC_BLOG_URL

RUN npm run build

# ============================================
# Stage 3: Runtime
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy built output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "server.js"]

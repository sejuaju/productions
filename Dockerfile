# Multi-stage build for Next.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

# Set build-time environment variables - UPDATED TO HTTPS FOR PRODUCTION
ENV FAUCET_PRIVATE_KEY=3ff552c5bea0bfae7bac71cff9f76043dadc26c7b832d2bb93039b130514135d
ENV UPSTASH_REDIS_REST_URL=https://relaxed-turkey-24544.upstash.io
ENV UPSTASH_REDIS_REST_TOKEN=AV_gAAIjcDFiYjE3MGMyNjg2OGE0OTI0OGQwN2FiNzE3MGI3MTExY3AxMA
ENV HCAPTCHA_SECRET_KEY=ES_413f0bab4d49470691bfbfb1b0f3e4db
ENV HCAPTCHA_VERIFY_URL=https://api.hcaptcha.com/siteverify
ENV NEXT_PUBLIC_API_BASE_URL=https://extswap.exatech.ai/api/v1
ENV NEXT_PUBLIC_API_FALLBACK_URL=https://extswap.exatech.ai/api/v1
ENV NEXT_PUBLIC_PRICE_API_URL=https://extswap.exatech.ai/api/price
ENV NEXT_PUBLIC_EXPLORER_API_URL=https://extswap.exatech.ai/api/explorer
ENV NEXT_PUBLIC_WEBSOCKET_URL=wss://extswap.exatech.ai/ws

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY services/gamification/ ./services/gamification/
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app .
RUN corepack enable && pnpm --filter @luvara/gamification build

FROM base AS runner
COPY --from=builder /app/services/gamification/dist ./dist
COPY --from=builder /app/services/gamification/package.json ./package.json
COPY --from=builder /app/services/gamification/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4008
CMD ["node", "dist/index.js"]

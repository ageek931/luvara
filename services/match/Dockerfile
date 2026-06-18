FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY services/match/ ./services/match/
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app .
RUN corepack enable && pnpm --filter @luvara/match build

FROM base AS runner
COPY --from=builder /app/services/match/dist ./dist
COPY --from=builder /app/services/match/package.json ./package.json
COPY --from=builder /app/services/match/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4003
CMD ["node", "dist/index.js"]

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY services/chat/ ./services/chat/
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app .
RUN corepack enable && pnpm --filter @luvara/chat build

FROM base AS runner
COPY --from=builder /app/services/chat/dist ./dist
COPY --from=builder /app/services/chat/package.json ./package.json
COPY --from=builder /app/services/chat/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4004
CMD ["node", "dist/index.js"]

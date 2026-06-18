FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY services/admin/ ./services/admin/
RUN corepack enable && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app .
RUN corepack enable && pnpm --filter @luvara/admin build

FROM base AS runner
COPY --from=deps /app/services/admin/dist ./dist
COPY --from=builder /app/services/admin/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4010
CMD ["node", "dist/index.js"]

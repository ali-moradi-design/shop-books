# Build context: repository root.  docker build -f apps/web/Dockerfile --build-arg API_URL=... .
# The build prerenders pages, so a reachable API (seeded database) is needed at build time.
FROM node:24-bookworm-slim AS build
RUN corepack enable
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile --filter @shop-books/web...
COPY apps/web apps/web
ARG API_URL=http://127.0.0.1:4100
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV API_URL=$API_URL NEXT_PUBLIC_API_URL=$API_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN pnpm --filter @shop-books/web build

FROM node:24-bookworm-slim
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "apps/web/server.js"]

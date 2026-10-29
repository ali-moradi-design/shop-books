# Build context: repository root.  docker build -f apps/api/Dockerfile .
# The final image holds only the compiled code (dist), the Prisma schema and migrations,
# and the production dependencies: no source code, no dev dependencies.
FROM node:24-bookworm-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS build
RUN npm install -g pnpm@12.15.0
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma
RUN pnpm install --frozen-lockfile --filter @shop-books/api...
COPY apps/api apps/api
# build, then copy the package with production dependencies only and generate its Prisma client
RUN pnpm --filter @shop-books/api build \
  && pnpm --filter @shop-books/api deploy --prod --legacy /out \
  && rm -rf /out/src /out/tests /out/dist && cp -r apps/api/dist /out/dist \
  && rm -f /out/dist/scripts/dev-db.* /out/dist/scripts/e2e-* \
  && cd /out && node_modules/.bin/prisma generate

# The local stack (root compose.yaml) uses this target too: seed and reset run from dist.
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out/package.json ./package.json
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/prisma ./prisma
COPY --from=build --chown=node:node /out/dist ./dist
RUN mkdir -p uploads/books && chown -R node:node uploads
# run as the image's unprivileged user; only uploads/ (a volume in production) is writable
USER node

EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node dist/server.js"]

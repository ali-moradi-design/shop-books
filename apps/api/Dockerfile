# Build context: repository root.  docker build -f apps/api/Dockerfile .
FROM node:24-bookworm-slim

ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* && corepack enable
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/api/prisma apps/api/prisma
# Dev dependencies stay: the container runs `prisma migrate deploy` and the demo reset script.
RUN pnpm install --frozen-lockfile --prod=false --filter @shop-books/api...

COPY apps/api apps/api
WORKDIR /repo/apps/api
RUN pnpm build && mkdir -p uploads/books

EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/server.js"]

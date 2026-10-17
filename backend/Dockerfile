FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p uploads && chown -R node:node /app
USER node
EXPOSE 4000
# migrate deploy only applies new, reviewed migrations (prisma/migrations/) —
# unlike `db push`, it never improvises schema changes against the live DB.
# seed.ts is idempotent (upserts admin/settings), safe to run on every boot.
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && node dist/index.js"]

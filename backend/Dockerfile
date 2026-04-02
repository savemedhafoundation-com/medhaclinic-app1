FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY scripts ./scripts
COPY tsconfig*.json ./
COPY src ./src
COPY api ./api

RUN npm run check

EXPOSE 8080

CMD ["npm", "start"]

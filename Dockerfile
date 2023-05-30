FROM node:18-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /usr/app

COPY --from=builder /app/dist ./dist
COPY package.json ./
RUN npm install
COPY ./app-config.yaml .

USER node
ENV NODE_ENV="production"
CMD ["node", "dist/index.js"]
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
RUN yarn install

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /usr/app

COPY --from=builder /app/dist ./dist
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
RUN yarn install
COPY ./app-config.yaml .
COPY ./migrations ./migrations
COPY ./init.sh .

USER node
ENV NODE_ENV="production"

CMD ["/bin/sh", "init.sh"]

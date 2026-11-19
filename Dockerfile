ARG NODE_IMAGE=node:26-alpine

FROM ${NODE_IMAGE} AS base
WORKDIR /app
RUN npm install -g pnpm@12.21.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

FROM base AS build
ARG APP
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm exec nest build ${APP}

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

FROM ${NODE_IMAGE} AS runtime
ARG APP
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./
COPY proto ./proto
COPY --from=build /app/dist/apps/${APP} ./dist
USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
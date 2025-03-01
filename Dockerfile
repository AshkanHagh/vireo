FROM registry.docker.ir/oven/bun:1.2.4 AS base
WORKDIR /usr/src/app

FROM base AS install
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production


FROM base AS release
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .

ENV NODE_ENV=production

USER bun
EXPOSE 7319
ENTRYPOINT [ "bun", "run", "src/server.ts" ]

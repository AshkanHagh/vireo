FROM oven/bun:latest as base

WORKDIR /app

COPY package.json bun.lockb* ./

RUN bun install

COPY . .

COPY .env .env

EXPOSE 7319

CMD ["bun", "run", "start"]

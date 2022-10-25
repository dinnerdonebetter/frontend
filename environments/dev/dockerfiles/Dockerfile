FROM node:16.16.0

WORKDIR /app

RUN npm install --global pnpm

COPY apps/web ./apps/web
COPY packages ./packages
COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ./turbo.json ./turbo.json

RUN pnpm install
RUN pnpm run build

RUN ls -Alh

ENTRYPOINT ["pnpm", "run", "start"]
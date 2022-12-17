FROM node:lts-bullseye

WORKDIR /src/github.com/prixfixeco/frontend

COPY . .

RUN yarn install

ENTRYPOINT [ "yarn", "run", "dev" ]

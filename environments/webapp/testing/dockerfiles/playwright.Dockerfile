FROM mcr.microsoft.com/playwright

WORKDIR /src/github.com/prixfixeco/webapp

COPY . .

RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

RUN npx playwright install

ENTRYPOINT [ "npx", "playwright", "test" ]

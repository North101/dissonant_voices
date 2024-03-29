FROM node:lts-alpine3.19 as base

WORKDIR /app

FROM base as deps

RUN apk add git

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile

FROM deps as build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

COPY . .

RUN yarn run build

FROM base as final

ENV NODE_ENV=production

USER node

COPY package.json .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD yarn start

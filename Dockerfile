# base node image
FROM node:18-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl


#########################
# Latest releases available at https://github.com/aptible/supercronic/releases

RUN apt-get update && apt-get install -y curl

ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.27/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=7dadd4ac827e7bd60b386414dfefc898ae5b6c63

RUN curl -fsSLO "$SUPERCRONIC_URL" \
 && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
 && chmod +x "$SUPERCRONIC" \
 && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
 && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic
#########################

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json .npmrc ./
RUN npm install --include=dev

ADD crontab ./
COPY every_1min.sh /myapp/every_1min.sh



# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# CRON RELATED start
RUN npm run build:cron
# CRON RELATED end

# Finally, build the production image with minimal footprint
FROM base

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/build /myapp/build
COPY --from=build /myapp/public /myapp/public

COPY --from=build /myapp/dist /myapp/dist
COPY --from=build /myapp/crontab /myapp/crontab

ADD . .


RUN chmod +x /myapp/every_1min.sh
RUN ls -lah /myapp
RUN mkdir -p /myapp/var/log
RUN cat /myapp/crontab


CMD ["npm", "start"]

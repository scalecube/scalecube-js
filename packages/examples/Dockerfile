# this docker is using us to verify published version
FROM node:lts-alpine3.11
RUN apk add python make g++
COPY . /var/app
WORKDIR /var/app
ARG VERSION=next
RUN yarn add \
    @scalecube/browser@${VERSION} \
    @scalecube/node@${VERSION} \
    @scalecube/routers@${VERSION} \
    @scalecube/transport-nodejs@${VERSION} \
    @scalecube/utils@${VERSION} \
    @scalecube/api@${VERSION}

RUN yarn build

CMD /bin/sh

FROM node:lts-alpine3.11
RUN apk add python make g++
COPY . /var/app
WORKDIR /var/app
RUN yarn

CMD /bin/sh
FROM mhart/alpine-node

RUN apk add python make g++

COPY . /var/app
WORKDIR /var/app
RUN npm i

CMD /bin/sh
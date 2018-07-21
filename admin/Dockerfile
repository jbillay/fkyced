FROM node:8-alpine

RUN apk add --no-cache make gcc g++ python

# Create app user with home directory
RUN addgroup admin -g 1001
RUN adduser admin -S /bin/false -h /home/admin -G admin -u 100

RUN npm install --global npm@5.6.0

ENV HOME=/home/admin

COPY package.json package-lock.json $HOME/admin/
RUN chown -R admin:admin $HOME/*

USER admin
WORKDIR $HOME/admin
RUN npm install

USER root
COPY . $HOME/admin
RUN chown -R admin:admin $HOME/*
USER admin

CMD [ "npm", "start" ]

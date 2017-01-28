FROM node:7

ADD . /app

WORKDIR /app

EXPOSE 3000

ENV PORT 3000

RUN npm install

RUN node_modules/.bin/bower install --allow-root

CMD npm start
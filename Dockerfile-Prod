FROM node:16
RUN apt-get update && apt-get -y install sudo
RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --ignore-engines
COPY . /app/
RUN yarn build
RUN yarn add -D http-server --ignore-engines
EXPOSE 3000
WORKDIR /app/build
CMD ["npx", "http-server", "-p", "3000"]

FROM node:16
RUN apt-get update && apt-get -y install sudo
RUN mkdir /app
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
COPY . /app
RUN yarn install --ignore-engines
EXPOSE 3000
CMD ["yarn", "start"]
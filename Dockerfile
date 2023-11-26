FROM node:16
RUN apt-get update && apt-get -y install sudo
RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install --ignore-engines
COPY . /app/
EXPOSE 3000
CMD ["yarn", "start"]

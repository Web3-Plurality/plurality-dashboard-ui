FROM node:18
RUN apt-get update
RUN mkdir /app
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install
COPY . /app/
EXPOSE 3000
CMD ["yarn", "start"]

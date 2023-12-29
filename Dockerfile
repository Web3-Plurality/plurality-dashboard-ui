FROM node:20
RUN apt-get update
RUN mkdir /app
WORKDIR /app
COPY .npmrc .svgrrc config-overrides.js package-lock.json package.json tsconfig.json /app/
RUN npm install 
COPY . /app/
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s","build"]

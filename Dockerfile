FROM node:18.19-slim
WORKDIR ./src
COPY package*.json ./
RUN npm i -g node-pre-gyp
RUN npm install --force
COPY . .
RUN npm run build

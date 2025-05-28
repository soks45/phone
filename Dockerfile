FROM node:18.19-alpine
WORKDIR ./src
COPY package*.json ./
RUN npm install --force
COPY . .
RUN npm run build

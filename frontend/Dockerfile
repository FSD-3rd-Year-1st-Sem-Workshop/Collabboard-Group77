FROM node:20-alpine AS builder 
WORKDIR /app
COPY package*.json ./

COPY . .

RUN npm run build
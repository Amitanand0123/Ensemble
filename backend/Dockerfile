FROM node:18-alpine AS base
WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY backend/ ./

EXPOSE ${PORT:-5000}
CMD ["node", "index.js"]
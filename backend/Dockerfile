FROM node:18-alpine AS base
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
ENV PORT=5000
EXPOSE ${PORT}
CMD ["node", "index.js"]
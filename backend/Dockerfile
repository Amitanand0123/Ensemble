FROM node:18-alpine

WORKDIR /usr/src/app/backend

COPY package*.json ./

RUN npm install # --omit=dev

COPY backend/ ./

EXPOSE ${PORT:-5000}

CMD [ "node", "index.js" ]
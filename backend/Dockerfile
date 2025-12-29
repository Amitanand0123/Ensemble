
FROM node:18-alpine 

WORKDIR /usr/src/app

COPY backend/package*.json ./  

RUN npm ci --omit=dev

COPY backend/ .

EXPOSE ${PORT:-5000}

CMD [ "node", "index.js" ]
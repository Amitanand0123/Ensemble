FROM node:18-alpine AS builder

WORKDIR /usr/src/app/frontend


COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./

ARG VITE_API_BASE_URL
ARG VITE_RAZORPAY_KEY_ID

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_RAZORPAY_KEY_ID=${VITE_RAZORPAY_KEY_ID}

RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /usr/src/app/frontend/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
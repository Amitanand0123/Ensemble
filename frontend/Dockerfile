FROM node:18-alpine AS builder

WORKDIR /usr/src/app/frontend


COPY frontend/package*.json ./

RUN npm install

COPY frontend/ ./

# Declares build-time arguments.
# These are used to inject environment variables into the build process (Vite exposes only VITE_ prefixed vars).

ARG VITE_API_BASE_URL
ARG VITE_RAZORPAY_KEY_ID

# Sets the above ARGs as ENV variables so Vite can access them during npm run build.

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_RAZORPAY_KEY_ID=${VITE_RAZORPAY_KEY_ID}

RUN npm run build

# Switches to a new, lightweight base image: NGINX on Alpine Linux.
# Ideal for static file serving.

FROM nginx:stable-alpine

# Copies the final build files (dist/) from the builder stage into NGINX's default HTML serving folder.
COPY --from=builder /usr/src/app/frontend/dist /usr/share/nginx/html

# Replaces the default NGINX config with your custom nginx.conf (for SPA routing, compression, etc.).
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exposes port 80 (standard HTTP port) to allow external traffic into the container.
EXPOSE 80

# Starts NGINX in the foreground (Docker containers exit if the main process ends).

# daemon off; keeps NGINX running as the main process.

CMD ["nginx", "-g", "daemon off;"]
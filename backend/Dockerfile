# Base image: Uses the official Node.js image (version 18) based on Alpine Linux, a minimal Linux distro.
FROM node:18-alpine 
  
# Sets the working directory inside the container to /usr/src/app.
# All subsequent commands (COPY, RUN, etc.) operate relative to this path.\
# If the folder doesn’t exist, Docker creates it.
WORKDIR /usr/src/app

# Copies package.json and package-lock.json from your host machine's backend/ directory into the container’s current working directory (/usr/src/app).
# package*.json is a glob pattern that matches both files.
COPY backend/package*.json ./  

# Runs npm ci to install only production dependencies:
# ci ensures a clean install using package-lock.json (no version changes).
# --omit=dev skips development-only dependencies (e.g., testing libraries).
# Ideal for production builds where you don’t need dev tools.
RUN npm ci --omit=dev

# Copies the entire backend/ folder into the container’s working directory.
# Now, your app’s source code (index.js, routes, controllers, etc.) is available inside the container.
COPY backend/ .

# Informs Docker that the app listens on a port, defaulting to 5000 if the PORT environment variable is not set.
# Note: This doesn’t actually publish the port — that happens with docker run -p.
EXPOSE ${PORT:-5000}

# This is the default command the container runs when it starts.
# It launches the Node.js app by executing node index.js.
CMD [ "node", "index.js" ]
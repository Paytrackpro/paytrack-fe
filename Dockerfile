# Build stage
FROM node:18-alpine as build-stage

# Build argument for BASE_URL
ARG BASE_URL=http://localhost:6789/api

WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy project files
COPY . .

# Create .env file for build
RUN echo "BASE_URL=${BASE_URL}" > .env

# Build for production
RUN yarn build

# Verify build output
RUN ls -la /app/dist/spa && \
    if [ ! -f /app/dist/spa/index.html ]; then \
        echo "Build failed: index.html not found"; \
        exit 1; \
    fi

# Production stage
FROM nginx:alpine

# Copy built app from build stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
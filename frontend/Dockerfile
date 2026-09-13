# Production-ready frontend Dockerfile with Vite build + Nginx serving

# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /build

# Build arguments for Vite environment variables
ARG VITE_BACKEND_URL=""
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions for reproducibility
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript and Vite
RUN npm run build

# Stage 2: Runtime with Nginx
FROM nginx:alpine

# Copy built application from builder
COPY --from=builder /build/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

# Production-ready backend Dockerfile with multi-stage build

# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install dependencies with exact versions for reproducibility
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript and bundle OpenAPI spec
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application and openapi spec from builder
COPY --from=builder /build/dist ./dist

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 5000

# Health check using native fetch in Node 20+
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:5000/').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1));"

# Run the application
CMD ["node", "dist/server.js"]

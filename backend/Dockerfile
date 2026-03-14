# ══════════════════════════════════════
# Stage 1 — Builder
# ══════════════════════════════════════
FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm install

# Copy source code
COPY src/ ./src/

# ══════════════════════════════════════
# Stage 2 — Production
# ══════════════════════════════════════
FROM node:18-alpine AS production

# Add non-root user for security
RUN addgroup -S taskflow && adduser -S taskflow -G taskflow

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --only=production

# Copy source code from builder stage
COPY --from=builder /app/src ./src

# Change ownership to non-root user
RUN chown -R taskflow:taskflow /app

# Switch to non-root user
USER taskflow

# Expose port
EXPOSE 3000

# Health check built into the image
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the app
CMD ["node", "src/index.js"]
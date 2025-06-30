# Production Dockerfile for AutoJobr
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./

# Create necessary directories
RUN mkdir -p uploads/resumes && chown -R nextjs:nodejs uploads

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start production server
CMD ["npm", "run", "start"]
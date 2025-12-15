FROM node:25 AS builder
WORKDIR /app

# Install dependencies
COPY blog/package*.json ./
RUN npm ci

# Copy source and build
COPY blog ./
RUN npm run build

# Production image
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
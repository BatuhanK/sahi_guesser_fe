# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

ENV VITE_SOCKET_URL=https://sahikaca.com/
ENV VITE_API_URL=https://sahikaca.com/api/

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.24-alpine

# Copy the built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 9999
EXPOSE 9999

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 
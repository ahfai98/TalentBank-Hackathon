# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
# Overwrite default nginx config with one that proxies to the backend service
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
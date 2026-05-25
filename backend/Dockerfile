# Use the full Debian-based Node image (not slim) – includes all libraries
FROM node:20-bookworm AS builder

# Install build tools (Python, make, g++, and also necessary for node-gyp)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage – also full image to ensure runtime libraries
FROM node:20-bookworm
WORKDIR /app

# Copy compiled app and node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/mock-data ./dist/mock-data

# Copy TypeScript source files needed for seed command
COPY --from=builder /app/src/commands ./src/commands
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.build.json ./

# Force rebuild of better-sqlite3 from source (fixes glibc issues)
RUN npm rebuild better-sqlite3

EXPOSE 3000
CMD ["node", "dist/main"]

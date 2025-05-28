# ----------- BUILD STAGE -----------
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package files
COPY ../../package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the app
COPY ../../ ./

# Build the app
RUN npm run build


# ----------- PRODUCTION STAGE -----------
FROM node:20-alpine

# Set working directory in the production image
WORKDIR /app

# Copy only what's needed
COPY ../../package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the NestJS default port
EXPOSE 3000

# Run the application
CMD ["node", "dist/main"]

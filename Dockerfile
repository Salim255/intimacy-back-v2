# ----------- BUILD STAGE -----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json from the build context root
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy rest of the app files (everything in the context)
COPY . .

# Build the app
RUN npm run build


# ----------- PRODUCTION STAGE -----------
FROM node:20-alpine

WORKDIR /app

# Copy only the package files needed
COPY package*.json ./

# Copy built files and node_modules from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/src/main.js"]

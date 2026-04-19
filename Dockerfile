FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy full application
COPY . .

# Build the Vite React application
RUN npm run build

# Expose port and start
ENV PORT=8080
EXPOSE 8080

# Run the Express server (which now serves the built frontend)
CMD ["node", "server/index.js"]

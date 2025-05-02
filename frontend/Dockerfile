# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Install serve for a production static server
RUN npm install -g serve

# Expose port 80
EXPOSE 80

# Start the static server
CMD ["serve", "-s", "dist", "-l", "80"]
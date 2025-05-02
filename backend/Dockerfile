# Use Node.js 18 Alpine image
FROM node:18-alpine

# Install necessary build tools for native dependencies
RUN apk add --no-cache make gcc g++ python3

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
# Use npm ci for more reliable installations in Docker
RUN npm ci

# Copy the rest of the application code
COPY . .

# Ensure node_modules are preserved
RUN mkdir -p node_modules

# Expose the port the app runs on
EXPOSE 3000

# Install nodemon globally
RUN npm install -g nodemon

# Set the command to run the application
CMD ["npm", "run", "dev"]
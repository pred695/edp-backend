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

# Expose port used by Vite dev server (default 5173)
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev", "--", "--host"]

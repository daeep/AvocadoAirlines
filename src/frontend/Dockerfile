FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend source code
COPY . .

# Create .eslintrc.js if it doesn't exist
RUN touch .eslintrc.js

# Expose port 8080 (Vue dev server)
EXPOSE 8080

# Set environment variable to ignore ESLint errors during development
ENV ESLINT_NO_DEV_ERRORS=true

# Start the development server
CMD ["npm", "run", "serve"] 
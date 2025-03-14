FROM node:18-alpine

WORKDIR /app/src/frontend

# Copy frontend package files
COPY src/frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY ./src/frontend ./

# Expose port
EXPOSE 8080

# Start development server
CMD ["npm", "run", "serve"] 
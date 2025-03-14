FROM node:18-alpine

WORKDIR /app

# Copy package files from the correct location
COPY ./src/api/package*.json ./

# Install dependencies
RUN npm install && npm install -g nodemon

# Copy source code
COPY ./src/api ./src/api

# Create logs directory with correct permissions
USER root
RUN mkdir -p /app/logs && \
    chown -R node:node /app && \
    chmod 777 /app/logs
USER node

EXPOSE 3000

CMD ["npm", "run", "dev"] 
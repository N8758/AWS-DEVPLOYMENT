FROM node:22-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Backend port
EXPOSE 5000

# Start backend
CMD ["npm", "start"]
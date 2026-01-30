# Use an official Node runtime as the base image
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose port
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]

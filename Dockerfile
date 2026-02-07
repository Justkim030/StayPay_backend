# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production-only dependencies
RUN npm install --omit=dev

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on (Railway will map this)
EXPOSE 3000

# The command to start your server
CMD ["node", "server.js"]

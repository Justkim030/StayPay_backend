# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production dependencies
# Using --omit=dev ensures devDependencies (like nodemon) are not installed
RUN npm install --omit=dev

# Copy the rest of your application's source code
COPY . .

# The port your app will run on inside the container
# Your hosting service (Fly.io) will map this to a public port
EXPOSE 3000

# The command to start your server
# We use your actual server file: server.js
CMD ["node", "server.js"]

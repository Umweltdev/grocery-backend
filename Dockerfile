# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source files
COPY . .

# Expose the port your app uses
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]

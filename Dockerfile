# Use the official Node.js image.
FROM node:18

# Install Inter Font
RUN apt-get update && apt-get install -y fonts-inter \
    && rm -rf /var/lib/apt/lists/* \
    && fc-cache -fv

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files.
COPY package*.json ./

# Install the dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Command to run the app.
CMD ["npm", "run", "start"]

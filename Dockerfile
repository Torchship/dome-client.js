# Define the base image
FROM node:18

# Create a directory in the container to hold the app code
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the app source to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 80

# Define the command to run the app
CMD [ "node", "client-app.js" ]

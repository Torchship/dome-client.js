FROM node:18-buster-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./

#RUN npm ci --only=production

# Bundle app source
#COPY . .

EXPOSE 5000

CMD [ "nodemon", "client-app.js" ]

# Use the official base image of node 18
FROM node:18

# Setting Up the work directory for container
WORKDIR /usr/src/app

# Copying the package and package lock json to the container
COPY package*.json ./

# Installing the depenecies  
RUN npm install

# Copying all the code to container
COPY . .

# Exposing Port 5501 to the host
EXPOSE 5501

# Starting the App 
CMD [ "npm", "run","dev"]
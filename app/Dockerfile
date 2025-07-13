# Dockerfile for Node.js app
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install -g nodemon

# Copy source code
COPY . .

EXPOSE 3000
CMD ["nodemon", "index.js"]

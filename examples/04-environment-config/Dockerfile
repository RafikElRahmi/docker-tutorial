ARG NODE_ENV=development
ARG BUILD_TIMESTAMP=unknown

FROM node:22-alpine

# Build-time arguments
ARG BUILD_TIMESTAMP
ENV BUILD_TIMESTAMP=${BUILD_TIMESTAMP}

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]

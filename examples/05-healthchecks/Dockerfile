FROM node:22-alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .

# Define health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

EXPOSE 3000
CMD ["node", "server.js"]

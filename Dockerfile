FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
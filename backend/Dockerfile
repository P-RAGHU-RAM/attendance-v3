FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies including devDependencies for development
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]

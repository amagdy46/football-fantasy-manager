FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma (Debian/Slim uses apt-get)
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]


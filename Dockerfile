FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Run as non-root user for security
USER node

EXPOSE 3000

CMD ["yarn", "start"]

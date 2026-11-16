FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public" npm run build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
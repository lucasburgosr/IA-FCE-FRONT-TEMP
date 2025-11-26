FROM node:20 AS builder

WORKDIR /app

COPY . .

COPY .env .env

RUN npm install
RUN npm run build

FROM node:20

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

CMD ["serve", "-s", "dist", "-l", "3000"]

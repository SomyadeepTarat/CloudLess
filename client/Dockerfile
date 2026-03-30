FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ENV REACT_APP_API_URL=http://localhost:5001
ENV REACT_APP_WS_URL=ws://localhost:5001

CMD ["npm", "start"]

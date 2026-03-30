FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

ARG REACT_APP_API_URL=http://localhost:5001
ARG REACT_APP_WS_URL=ws://localhost:5001
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL

CMD ["npm", "start"]

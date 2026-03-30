FROM node:18-bullseye-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

COPY server/package*.json ./
RUN npm install --production

COPY server ./
COPY ml ../ml

RUN pip3 install --no-cache-dir -r /app/ml/requirements-runtime.txt

ENV PORT=5001
ENV PYTHON_BIN=/usr/bin/python3

EXPOSE 5001

CMD ["npm", "start"]
